import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserEntity } from '../interfaces/user';

@Injectable()
export class ServiceTokenGuardMock implements CanActivate {
  // MARK: - Private Properties
  private readonly user: UserEntity;

  // MARK: - Initialization
  constructor(user: UserEntity) {
    this.user = user;
  }

  // MARK: - Public Methods
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = this.user;

    return true;
  }
}
