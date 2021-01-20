import { Bigtable, Instance, Table } from '@google-cloud/bigtable';
import { Inject, Injectable } from '@nestjs/common';
import {
  CoreConfig,
  CoreConfigProvider,
} from '../../../app/config/namespace/core.config';
import {
  LikeConfig,
  LikeConfigProvider,
} from '../../../app/config/namespace/like.config';
import { UserUUID } from '../../../chat/interfaces/storage';
import {
  AggregateLike,
  LikeModel,
  LikeStorageProvider,
  ObjectType,
  ObjectUUID,
  Vote,
} from '../../interfaces/storage';
import { LikeConfigException } from '../../like.exception';

enum ColumnFamily {
  LikedBy = 'likedBy',
}

type ObjectLikes = { [user: string]: Vote };

interface ObjectData {
  [ColumnFamily.LikedBy]: ObjectLikes;
}

type StoredObjectLikes = {
  [user: string]: [{ value: Vote; labels: any[]; timestamp: string }];
};

interface StoredObjectData {
  [ColumnFamily.LikedBy]: StoredObjectLikes;
}

@Injectable()
export class BigtableLikeStorage implements LikeStorageProvider {
  // MARK: - Private Properties
  private readonly bigtable: Bigtable;
  private readonly instance: Instance;

  // MARK: - Initialization
  constructor(
    @Inject(CoreConfig.KEY) { gcp: { projectId } }: CoreConfigProvider,
    @Inject(LikeConfig.KEY)
    { bigtable: { instanceId, host, port } }: LikeConfigProvider,
  ) {
    if (!instanceId) {
      throw new Error(LikeConfigException.NoBigtableInstanceId);
    }

    this.bigtable = new Bigtable({
      projectId,
      apiEndpoint: host && port ? `${host}:${port}` : undefined,
    });

    this.instance = this.bigtable.instance(instanceId!);
  }

  // MARK: - Public Methods
  async reset(): Promise<void> {
    const [tables] = await this.instance.getTables();

    for (const table of tables) {
      await table.delete();
    }
  }

  // MARK: LikeStorageProvider
  async setLike(
    objectId: ObjectUUID,
    objectType: ObjectType,
    user: UserUUID,
    vote: Vote,
  ): Promise<void> {
    const table = await this.getTable(objectType);

    const objectData: ObjectData = {
      likedBy: {
        [user]: vote,
      },
    };

    const objectRow = { key: objectId, data: objectData };

    await table.insert(objectRow);
  }

  async getLikes(
    objectId: ObjectUUID,
    objectType: ObjectType,
  ): Promise<AggregateLike> {
    const objectLikes = await this.getObjectLikes(objectId, objectType);

    if (!objectLikes) {
      return {
        objectId,
        objectType,
        votes: {
          up: 0,
          neutral: 0,
          down: 0,
        },
      };
    }

    const votes = Object.values(objectLikes).reduce(
      (votes, userLike) => {
        const userVote = userLike[0].value;

        if (userVote === Vote.Up) {
          votes.up = votes.up + 1;
        } else if (userVote === Vote.Neutral) {
          votes.neutral = votes.neutral + 1;
        } else {
          votes.down = votes.down + 1;
        }

        return votes;
      },
      {
        up: 0,
        neutral: 0,
        down: 0,
      },
    );

    return {
      objectId,
      objectType,
      votes,
    };
  }

  async getLike(
    objectId: ObjectUUID,
    objectType: ObjectType,
    user: ObjectUUID,
  ): Promise<LikeModel | undefined> {
    const objectLikes = await this.getObjectLikes(objectId, objectType, user);

    if (!objectLikes) {
      return undefined;
    }

    const userVote = objectLikes[user][0].value;

    return {
      objectId,
      objectType,
      user,
      vote: userVote,
    };
  }

  // MARK: - Private Methods
  private async getTable(objectType: ObjectType): Promise<Table> {
    let table = this.instance.table(objectType);
    const [tableExists] = await table.exists();

    if (!tableExists) {
      const [newTable] = await this.instance.createTable(objectType, {
        families: [
          {
            name: ColumnFamily.LikedBy,
            rule: {
              versions: 1, // only store most recent cell value
            },
          },
        ],
      });

      table = newTable;
    }

    return table;
  }

  private async getObjectLikes(
    objectId: ObjectUUID,
    objectType: ObjectType,
    user?: UserUUID,
  ): Promise<StoredObjectLikes | undefined> {
    const table = await this.getTable(objectType);

    const objectRowRef = table.row(objectId);
    const [objectRowExists] = await objectRowRef.exists();

    if (!objectRowExists) {
      return undefined;
    }

    let storedObjectData: StoredObjectData;

    if (user !== undefined) {
      storedObjectData = (
        await objectRowRef.get([`${ColumnFamily.LikedBy}:${user}`])
      )[0];
    } else {
      storedObjectData = (await objectRowRef.get())[0].data as StoredObjectData;
    }

    return storedObjectData[ColumnFamily.LikedBy];
  }
}
