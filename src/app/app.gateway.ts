import {
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { AppEvent } from './event';
import { HealthStatus } from './interfaces/health';

@WebSocketGateway()
export class AppGateway {
  // MARK: Event Handler
  @SubscribeMessage(AppEvent.HealthRequest)
  getHealth(): WsResponse<HealthStatus> {
    // @TODO: return class instance conforming to `WsResponse` interface
    // to support `ClassSerializerInterceptor`
    return { event: AppEvent.HealthStatus, data: HealthStatus.Normal };
  }
}
