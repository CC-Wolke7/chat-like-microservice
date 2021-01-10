import { UserUUID } from '../../../chat/interfaces/storage';
import { ServiceAccount } from './service-account';

export enum UserType {
  Anonymous = 'Anonymous',
  ServiceAccount = 'SERVICE_ACCOUNT',
  User = 'USER',
}

export interface BaseUser {
  type: UserType;
}

export interface AnonymousUser extends BaseUser {
  type: UserType.Anonymous;
}

export interface AuthenticatedUser extends BaseUser {
  type: UserType.User;
  uuid: UserUUID;
}

export type UserEntity = AnonymousUser | ServiceAccount | AuthenticatedUser;
