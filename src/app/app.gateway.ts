import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { AppEvent } from './event';
import { HealthStatus } from './interfaces/health';

@WebSocketGateway()
export class AppGateway {
  // MARK: - Private Properties
  @WebSocketServer()
  private readonly server: Server;

  // MARK: - Public Methods
  // MARK: Event Handler
  @SubscribeMessage(AppEvent.HealthRequest)
  getHealth(): void {
    // @TODO: return class instance conforming to `WsResponse` interface
    // to support `ClassSerializerInterceptor`

    this.broadcast({ event: AppEvent.HealthStatus, data: HealthStatus.Normal });

    // WsResponse<HealthStatus>
    // return { event: AppEvent.HealthStatus, data: HealthStatus.Normal };
  }

  // MARK: - Private Methods
  private broadcast(payload: WsResponse): void {
    for (const client of this.server.clients) {
      client.send(JSON.stringify(payload));
    }
  }
}
