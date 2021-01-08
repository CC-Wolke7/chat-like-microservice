import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthStrategyName } from '../strategy';
import { UserType } from '../interfaces/user';
import {
  ServiceAccount,
  ServiceAccountName,
} from '../interfaces/service-account';

// @TODO: configure via env
const SERVICE_TOKEN_WHITELIST = [
  'NTZiYWU4YjE1ZmQyYzdlMGViZDI1Y2EzODMzZTUxZjQK',
];

const SERVICE_ACCOUNT_DETAILS_FOR_SERVICE_TOKEN = new Map<
  string,
  Omit<ServiceAccount, 'type'>
>([
  [
    'NTZiYWU4YjE1ZmQyYzdlMGViZDI1Y2EzODMzZTUxZjQK',
    {
      name: ServiceAccountName.RecommenderBot,
      uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
    },
  ],
]);

export class ServiceTokenStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.ServiceToken,
) {
  // MARK: - Public Methods
  validate(token: string): ServiceAccount {
    if (!SERVICE_TOKEN_WHITELIST.includes(token)) {
      throw new UnauthorizedException();
    }

    const details = SERVICE_ACCOUNT_DETAILS_FOR_SERVICE_TOKEN.get(token);

    if (!details) {
      throw new InternalServerErrorException();
    }

    return {
      type: UserType.ServiceAccount,
      ...details,
    };
  }
}
