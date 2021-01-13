import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
} from '@nestjs/websockets';
import { AppEvent } from './event';
import { HealthStatus } from './interfaces/health';
import * as WebSocket from 'ws';

@WebSocketGateway()
export class AppGateway {
  // MARK: - Public Methods
  // MARK: Event Handler
  @SubscribeMessage(AppEvent.HealthRequest)
  getHealth(@ConnectedSocket() socket: WebSocket): void {
    socket.send(
      JSON.stringify({
        event: AppEvent.HealthStatus,
        data: HealthStatus.Normal,
      }),
    );
  }
}
