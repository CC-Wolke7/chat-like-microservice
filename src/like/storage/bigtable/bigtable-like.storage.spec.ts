import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../../../app/config/config.module';
import { UserUUID } from '../../../chat/interfaces/storage';
import { ObjectType, ObjectUUID, Vote } from '../../interfaces/storage';
import { BigtableLikeStorage } from './bigtable-like.storage';

describe('BigtableLikeStorage', () => {
  // MARK: - Properties
  let storage: BigtableLikeStorage;

  const OBJECT_ID: ObjectUUID = 'da9469c5-ccad-47c7-8e06-a33c420d8fb9';
  const OBJECT_TYPE: ObjectType = ObjectType.Offer;
  const USER_1: UserUUID = '640b1524-08e5-4ef6-97cf-7d44966f5b4a';
  const USER_2: UserUUID = 'e30d195c-a4de-4be0-b318-7aca6575c7c3';
  const USER_3: UserUUID = 'b022e6c6-9541-4ab7-9c15-6677b651ed64';

  // MARK: - Hooks
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [],
      providers: [BigtableLikeStorage],
    }).compile();

    storage = app.get<BigtableLikeStorage>(BigtableLikeStorage);

    await storage.reset();
  });

  // MARK: - Tests
  // https://github.com/googleapis/nodejs-bigtable/issues/612#issuecomment-589133501
  // https://stackoverflow.com/questions/57205288/bigtable-trying-to-determine-if-row-exists-emulator-hangs-for-nonexistent-rows/59273288#59273288
  // it('should return `undefined` if user has not liked object', async () => {
  //   expect(await storage.getLike(objectId, objectType, user)).toEqual(
  //     undefined,
  //   );
  // });

  it('should store and return user like', async () => {
    const expectedVote = Vote.Down;

    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_1, expectedVote);

    const storedLike = await storage.getLike(OBJECT_ID, OBJECT_TYPE, USER_1);

    expect(storedLike).toBeDefined();
    expect(storedLike!.objectId).toEqual(OBJECT_ID);
    expect(storedLike!.objectType).toEqual(OBJECT_TYPE);
    expect(storedLike!.user).toEqual(USER_1);
    expect(storedLike!.vote).toEqual(expectedVote);
  });

  it('should store and return most recent user like', async () => {
    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_1, Vote.Down);
    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_1, Vote.Neutral);

    const expectedVote = Vote.Up;

    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_1, expectedVote);

    const storedLike = await storage.getLike(OBJECT_ID, OBJECT_TYPE, USER_1);

    expect(storedLike).toBeDefined();
    expect(storedLike!.vote).toEqual(expectedVote);
  });

  it('should store multiple independent user likes for same object', async () => {
    const voteForUser1 = Vote.Neutral;
    const voteForUser2 = Vote.Down;

    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_1, voteForUser1);
    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_2, voteForUser2);

    const storedLikeForUser1 = await storage.getLike(
      OBJECT_ID,
      OBJECT_TYPE,
      USER_1,
    );

    expect(storedLikeForUser1).toBeDefined();
    expect(storedLikeForUser1!.vote).toEqual(voteForUser1);

    const storedLikeForUser2 = await storage.getLike(
      OBJECT_ID,
      OBJECT_TYPE,
      USER_2,
    );

    expect(storedLikeForUser2).toBeDefined();
    expect(storedLikeForUser2!.vote).toEqual(voteForUser2);
  });

  it('should aggregate user likes for same object', async () => {
    const voteForUser1 = Vote.Neutral;
    const voteForUser2 = Vote.Down;
    const voteForUser3 = Vote.Down;

    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_1, voteForUser1);
    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_2, voteForUser2);
    await storage.setLike(OBJECT_ID, OBJECT_TYPE, USER_3, voteForUser3);

    const objektLikes = await storage.getLikes(OBJECT_ID, OBJECT_TYPE);

    expect(objektLikes.objectId).toEqual(OBJECT_ID);
    expect(objektLikes.objectType).toEqual(OBJECT_TYPE);
    expect(objektLikes.votes.up).toEqual(0);
    expect(objektLikes.votes.neutral).toEqual(1);
    expect(objektLikes.votes.down).toEqual(2);
  });
});
