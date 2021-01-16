import { Vote } from '../../../src/like/interfaces/storage';

export interface PublicOfferLikes {
  total: number;
  user?: Vote.Up | Vote.Neutral;
}
