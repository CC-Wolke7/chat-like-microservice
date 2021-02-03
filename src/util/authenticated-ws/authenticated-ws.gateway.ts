import * as WebSocket from 'ws';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WsResponse,
} from '@nestjs/websockets';
import { AuthenticatedWsGatewayEvent } from './authenticated-ws.event';
import {
  WsAuthRequestPayload,
  WsAuthResponse,
  WsAuthStatus,
} from './authenticated-ws.dto';

export interface AbstractWsUser {
  uuid: string;
}

export type AuthenticatedWebSocket<T extends AbstractWsUser> = WebSocket & {
  user: T;
};

export abstract class AuthenticatedWsGateway<T extends AbstractWsUser>
  implements OnGatewayDisconnect<WebSocket> {
  // MARK: - Private Properties
  protected readonly socketForAuthenticatedUser = new Map<
    T['uuid'],
    AuthenticatedWebSocket<T>
  >();

  // MARK: - Public Methods
  abstract verifyUser(payload: WsAuthRequestPayload): Promise<T | undefined>;

  // MARK: Lifecycle
  handleDisconnect(socket: WebSocket): void {
    if ((socket as any).user !== undefined) {
      this.socketForAuthenticatedUser.delete(
        (socket as AuthenticatedWebSocket<T>).user.uuid,
      );
    }
  }

  // MARK: Event Handler
  @SubscribeMessage(AuthenticatedWsGatewayEvent.AuthRequest)
  async authenticate(
    @ConnectedSocket() socket: WebSocket,
    @MessageBody() payload: WsAuthRequestPayload,
  ): Promise<void> {
    const user = await this.verifyUser(payload);

    let response: WsResponse<WsAuthResponse>;

    if (!user) {
      response = {
        event: AuthenticatedWsGatewayEvent.AuthResponse,
        data: {
          status: WsAuthStatus.Unauthorized,
        },
      };
    } else {
      (socket as AuthenticatedWebSocket<T>).user = user;

      this.socketForAuthenticatedUser.set(
        user.uuid,
        socket as AuthenticatedWebSocket<T>,
      );

      response = {
        event: AuthenticatedWsGatewayEvent.AuthResponse,
        data: {
          status: WsAuthStatus.Success,
        },
      };
    }

    socket.send(JSON.stringify(response));
  }
}
