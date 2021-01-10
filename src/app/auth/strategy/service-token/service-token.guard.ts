import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ServiceAccount,
  ServiceAccountName,
} from '../../interfaces/service-account';
import { AuthStrategyName } from '../../strategy';

@Injectable()
export class ServiceTokenGuard extends AuthGuard(
  AuthStrategyName.ServiceToken,
) {}

@Injectable()
export class RecommenderBotGuard implements CanActivate {
  // MARK: - Public Methods
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const serviceAccount = request.user as ServiceAccount;

    return serviceAccount.name === ServiceAccountName.RecommenderBot;
  }
}
