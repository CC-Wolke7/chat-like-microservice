import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from '../interfaces/user';

@Injectable()
export class AuthGuardMock implements CanActivate {
  // MARK: - Private Properties
  private readonly user: UserEntity | undefined;

  // MARK: - Initialization
  constructor(user: UserEntity | undefined) {
    this.user = user;
  }

  // MARK: - Public Methods
  canActivate(context: ExecutionContext): boolean {
    if (!this.user) {
      throw new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();
    request.user = this.user;

    return true;
  }
}
