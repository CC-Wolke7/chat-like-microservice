import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthStrategyName } from '../../strategy';
import { UserType } from '../../interfaces/user';
import { ServiceAccount } from '../../interfaces/service-account';
import serviceAccountConfig, {
  ServiceAccountConfig,
} from '../../../config/service-account.config';

export class ServiceTokenStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.ServiceToken,
) {
  // MARK: - Private Properties
  private readonly config: ServiceAccountConfig;

  // MARK: - Initialization
  constructor(@Inject(serviceAccountConfig.KEY) config: ServiceAccountConfig) {
    super({ session: false });
    this.config = config;
  }

  // MARK: - Public Methods
  validate(token: string): ServiceAccount {
    if (!this.config.tokenWhitelist.includes(token)) {
      throw new UnauthorizedException();
    }

    const details = this.config.accountForToken[token];

    if (!details) {
      throw new InternalServerErrorException();
    }

    return {
      type: UserType.ServiceAccount,
      ...details,
    };
  }
}
