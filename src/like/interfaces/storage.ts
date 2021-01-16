import { UserUUID } from '../../chat/interfaces/storage';

// MARK: - Model
export type ObjectUUID = string;
export type OfferUUID = ObjectUUID;

export enum ObjectType {
  Offer = 'offer',
}

export enum Vote {
  Up = 1,
  Neutral = 0,
  Down = -1,
}

export interface LikeModel {
  objectId: ObjectUUID;
  objectType: ObjectType;
  user: UserUUID;
  vote: Vote;
}

export interface AggregateLike {
  objectId: ObjectUUID;
  objectType: ObjectType;
  votes: {
    up: number;
    neutral: number;
    down: number;
  };
}

// MARK: - Provider
export interface LikeStorageProvider {
  setLike(
    objectId: ObjectUUID,
    objectType: ObjectType,
    user: UserUUID,
    vote: Vote,
  ): Promise<void>;
  getLikes(
    objectId: ObjectUUID,
    objectType: ObjectType,
  ): Promise<AggregateLike>;
  getLike(
    objectId: ObjectUUID,
    objectType: ObjectType,
    user: ObjectUUID,
  ): Promise<LikeModel | undefined>;
}
