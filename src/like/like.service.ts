import { Inject, Injectable } from '@nestjs/common';
import { UserUUID } from '../chat/interfaces/storage';
import { ProviderToken } from '../provider';
import {
  AggregateLike,
  LikeStorageProvider,
  ObjectType,
  OfferUUID,
  Vote,
} from './interfaces/storage';

@Injectable()
export class LikeService {
  // MARK: - Private Properties
  private readonly storage: LikeStorageProvider;

  // MARK: - Initialization
  constructor(
    @Inject(ProviderToken.LIKE_STORAGE) storage: LikeStorageProvider,
  ) {
    this.storage = storage;
  }

  // MARK: - Public Methods
  async getOfferLikes(offer: OfferUUID): Promise<AggregateLike> {
    return this.storage.getLikes(offer, ObjectType.Offer);
  }

  async getOfferLike(
    offer: OfferUUID,
    user: UserUUID,
  ): Promise<Vote.Up | Vote.Neutral | undefined> {
    return (await this.storage.getLike(offer, ObjectType.Offer, user))?.vote as
      | Vote.Up
      | Vote.Neutral
      | undefined;
  }

  async toggleOfferLike(offer: OfferUUID, user: UserUUID): Promise<void> {
    const currentVote = (
      await this.storage.getLike(offer, ObjectType.Offer, user)
    )?.vote;

    let newVote: Vote;

    if (currentVote === undefined) {
      newVote = Vote.Up;
    } else if (currentVote === Vote.Up) {
      newVote = Vote.Neutral;
    } else {
      newVote = Vote.Up;
    }

    return this.storage.setLike(offer, ObjectType.Offer, user, newVote);
  }
}
