import { UserUUID } from '../../../chat/interfaces/storage';
import { BaseUser, UserType } from './user';

export enum ServiceAccountName {
  RecommenderBot = 'RECOMMENDER_BOT',
  UnitTest = 'UNIT_TEST',
}

export interface ServiceAccount extends BaseUser {
  type: UserType.ServiceAccount;
  name: ServiceAccountName;
  uuid?: UserUUID;
}

export interface ServiceAccountUser extends ServiceAccount {
  uuid: UserUUID;
}

export interface RecommenderBot extends ServiceAccountUser {
  name: ServiceAccountName.RecommenderBot;
}
