import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { ChatNotificationProvider } from './interfaces/notification';
import { Chat, ChatMessage } from './interfaces/storage';
import { Server } from 'ws';
import { ChatEvent } from './event';
import { HealthStatus } from '../app/interfaces/health';
import { UseGuards } from '@nestjs/common';
import { ServiceTokenGuard } from '../auth/service-token/service-token.guard';

@WebSocketGateway()
export class ChatGateway implements ChatNotificationProvider {
  // MARK: - Private Properties
  @WebSocketServer()
  private readonly server: Server;

  // MARK: - Initialization

  // MARK: - Public Methods
  // MARK: Event Handler
  // @UseGuards(ServiceTokenGuard)
  // @SubscribeMessage(ChatEvent.CreateMessageRequest)
  // createMessage(): void {
  //   // save in db and notify participants
  // }

  // @SubscribeMessage(ChatEvent.CreateMessageRequest)
  // getHealth(): WsResponse<HealthStatus> {
  //   // @TODO: return class instance conforming to `WsResponse` interface
  //   // to support `ClassSerializerInterceptor`
  //   return {
  //     event: ChatEvent.MessageCreated,
  //     data: HealthStatus.Normal,
  //   };
  // }

  // MARK: Chat Notification Provider
  async notifyChatCreated(chat: Chat): Promise<void> {
    // send chat to chat participants (excluding creator)
  }

  async notifyMessageCreated(chat: Chat, message: ChatMessage): Promise<void> {
    // send message to chat participants (excluding sender)
  }
}
