import {
  Catch,
  WsExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ChatEvent } from './chat.gateway.event';

@Catch()
export class ChatGatewayExceptionFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const socket = host.switchToWs().getClient() as WebSocket;

    if (exception instanceof HttpException) {
      socket.send(
        JSON.stringify({ event: ChatEvent.ChatError, data: exception.message }),
      );
    } else if (exception instanceof WsException) {
      socket.send(
        JSON.stringify({
          event: ChatEvent.ChatError,
          data: exception.getError(),
        }),
      );
    } else {
      // @TODO: handle safely or ignore
      // socket.send(
      //   JSON.stringify({
      //     event: ChatEvent.ChatError,
      //     data: JSON.stringify(exception),
      //   }),
      // );
    }
  }
}
