import { Vote } from './interfaces/storage';

// MARK: - Response Payload
export class OfferLikes {
  total: number;
  user?: Vote.Up | Vote.Neutral;
}

export type GetOfferLikesResponse = OfferLikes;
