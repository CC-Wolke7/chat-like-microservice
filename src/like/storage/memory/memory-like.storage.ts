import { Injectable } from '@nestjs/common';
import { UserUUID } from '../../../chat/interfaces/storage';
import {
  AggregateLike,
  LikeModel,
  LikeStorageProvider,
  ObjectType,
  ObjectUUID,
  Vote,
} from '../../interfaces/storage';

@Injectable()
export class InMemoryLikeStorage implements LikeStorageProvider {
  // MARK: - Private Properties
  private likesForObjectType: {
    [ObjectType.Offer]: {
      [objectId: string]: { [user: string]: Vote } | undefined;
    };
  } = { [ObjectType.Offer]: {} };

  // MARK: - Public Methods
  reset(): void {
    this.likesForObjectType = { [ObjectType.Offer]: {} };
  }

  // MARK: LikeStorageProvider
  async setLike(
    objectId: ObjectUUID,
    objectType: ObjectType,
    user: UserUUID,
    vote: Vote,
  ): Promise<void> {
    const objectLikes = this.likesForObjectType[objectType][objectId];

    if (!objectLikes) {
      this.likesForObjectType[objectType][objectId] = {};
    }

    this.likesForObjectType[objectType][objectId]![user] = vote;
  }

  async getLikes(
    objectId: ObjectUUID,
    objectType: ObjectType,
  ): Promise<AggregateLike> {
    const objectLikes = this.likesForObjectType[objectType][objectId];

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
      (votes, userVote) => {
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
    const objectLikes = this.likesForObjectType[objectType][objectId];

    if (!objectLikes) {
      return undefined;
    }

    const userVote = objectLikes![user];

    return {
      objectId,
      objectType,
      user,
      vote: userVote,
    };
  }
}
