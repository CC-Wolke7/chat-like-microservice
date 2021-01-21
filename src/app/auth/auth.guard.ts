import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import {
  ServiceAccount,
  ServiceAccountName,
} from './interfaces/service-account';
import { AuthStrategyName } from './strategy';

// Authentication
@Injectable()
export class AnonymousGuard extends AuthGuard(AuthStrategyName.Anonymous) {}

@Injectable()
export class ServiceTokenGuard extends AuthGuard(
  AuthStrategyName.ServiceToken,
) {}

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(AuthStrategyName.GoogleOAuth) {}

// Authorization
@Injectable()
export class ServiceAccountUserGuard implements CanActivate {
  // MARK: - Public Methods
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const serviceAccount = request.user as ServiceAccount;

    return serviceAccount.uuid !== undefined;
  }
}

@Injectable()
export class RecommenderBotGuard implements CanActivate {
  // MARK: - Public Methods
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const serviceAccount = request.user as ServiceAccount;

    return serviceAccount.name === ServiceAccountName.RecommenderBot;
  }
}

// Helper
// https://github.com/nestjs/nest/issues/873
abstract class ComposeGuard implements CanActivate {
  // MARK: - Private Properties
  protected readonly guards: CanActivate[];

  // MARK: - Initialization
  constructor(...guards: CanActivate[]) {
    this.guards = guards;
  }

  // MARK: - Public Methods
  // MARK: CanActivate
  abstract canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>;
}

@Injectable()
export class OrAuthGuard extends ComposeGuard {
  // MARK: - Public Methods
  // MARK: CanActivate
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let didPassAnyGuard = false;
    let hasAuthorizationError = false;

    for (const guard of this.guards) {
      try {
        if (didPassAnyGuard) {
          // allow other guards to modify request, e.g. attach identity
          await guard.canActivate(context);
          continue;
        }

        let canActivate = await guard.canActivate(context);

        if (typeof canActivate !== 'boolean') {
          canActivate = await canActivate.toPromise();
        }

        didPassAnyGuard = canActivate;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          hasAuthorizationError = true;
        }
      }
    }

    if (didPassAnyGuard) {
      return true;
    }

    if (hasAuthorizationError) {
      throw new ForbiddenException();
    } else {
      throw new UnauthorizedException();
    }
  }
}

@Injectable()
export class AndAuthGuard extends ComposeGuard {
  // MARK: - Public Methods
  // MARK: CanActivate
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let didFailAnyGuard = false;
    let hasAuthorizationError = false;

    for (const guard of this.guards) {
      try {
        let canActivate = await guard.canActivate(context);

        if (typeof canActivate !== 'boolean') {
          canActivate = await canActivate.toPromise();
        }

        if (!canActivate) {
          didFailAnyGuard = true;
          break;
        }
      } catch (error) {
        didFailAnyGuard = true;

        if (error instanceof ForbiddenException) {
          hasAuthorizationError = true;
        }
      }
    }

    if (!didFailAnyGuard) {
      return true;
    }

    if (hasAuthorizationError) {
      throw new ForbiddenException();
    } else {
      throw new UnauthorizedException();
    }
  }
}
