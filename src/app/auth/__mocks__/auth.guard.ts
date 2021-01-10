import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from '../interfaces/user';
import { WsException } from '@nestjs/websockets';
import { ChatGatewayException } from '../../../chat/gateway/exception';

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
      if (context.getType() === 'ws') {
        throw new WsException(ChatGatewayException.Unauthorized);
      } else {
        throw new UnauthorizedException();
      }
    }

    const request = context.switchToHttp().getRequest();
    request.user = this.user;

    // @TODO: set user for WS https://github.com/nestjs/nest/issues/1254#issuecomment-453280476

    return true;
  }
}
