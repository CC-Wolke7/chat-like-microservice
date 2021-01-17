import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthStrategyName } from '../../strategy';
import { UserType } from '../../interfaces/user';
import { ServiceAccount } from '../../interfaces/service-account';
import {
  ServiceAccountConfig,
  ServiceAccountConfigProvider,
} from '../../../config/namespace/service-account.config';
import { AppException } from '../../../app.exception';

@Injectable()
export class ServiceTokenStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.ServiceToken,
) {
  // MARK: - Private Properties
  private readonly config: ServiceAccountConfigProvider;

  // MARK: - Initialization
  constructor(
    @Inject(ServiceAccountConfig.KEY) config: ServiceAccountConfigProvider,
  ) {
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
      throw new InternalServerErrorException(
        AppException.NoDetailsForServiceToken,
      );
    }

    return {
      type: UserType.ServiceAccount,
      ...details,
    };
  }
}
