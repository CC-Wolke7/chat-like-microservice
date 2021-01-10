import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { ChatNotificationProvider } from '../interfaces/notification';
import { Chat, ChatMessage, ChatUUID, UserUUID } from '../interfaces/storage';
import * as WebSocket from 'ws';
import { ChatEvent } from './event';
import {
  ServiceAccountUser,
  ServiceAccountName,
  RecommenderBot,
} from '../../app/auth/interfaces/service-account';
import { UserType } from '../../app/auth/interfaces/user';
import { CreateMessageEventPayload } from './interfaces/dto.gateway';
import { ChatService } from '../chat.service';
import { ChatGatewayException } from './exception';

// @TODO: abstract chat rooms - https://github.com/afertil/nest-chat-api
@WebSocketGateway()
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    ChatNotificationProvider {
  // MARK: - Private Properties
  private readonly service: ChatService;

  private readonly socketForUser = new Map<UserUUID, WebSocket | undefined>();

  private user: ServiceAccountUser = {
    type: UserType.ServiceAccount,
    name: ServiceAccountName.UnitTest,
    uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
  };

  // MARK: - Initialization
  constructor(service: ChatService) {
    this.service = service;
  }

  // MARK: - Public Methods
  // MARK: Lifecycle
  handleConnection(socket: WebSocket): void {
    const user = this.user.uuid;
    this.socketForUser.set(user, socket);
  }

  handleDisconnect(socket: WebSocket): void {
    const user = this.user.uuid;
    this.socketForUser.delete(user);
  }

  // MARK: Event Handler
  @SubscribeMessage(ChatEvent.CreateMessage)
  async createMessage(
    @MessageBody() payload: CreateMessageEventPayload,
  ): Promise<void> {
    const user = this.user;

    const chat = await this.getChat(payload.chat);
    this.service.checkParticipation(chat, user.uuid);

    const message = await this.service.createMessage(
      chat.uuid,
      user as RecommenderBot,
      payload.message,
    );

    await this.notifyMessageCreated(chat, message);
  }

  // MARK: Chat Notification Provider
  async notifyChatCreated(chat: Chat, includeCreator = true): Promise<void> {
    const payload: WsResponse<Chat> = {
      event: ChatEvent.ChatCreated,
      data: chat,
    };

    this.broadcast(
      new Set(
        chat.participants.filter(
          (participant) => includeCreator || participant !== chat.creator,
        ),
      ),
      payload,
    );
  }

  async notifyMessageCreated(
    chat: Chat,
    message: ChatMessage,
    includeSender = true,
  ): Promise<void> {
    const payload: WsResponse<ChatMessage> = {
      event: ChatEvent.MessageCreated,
      data: message,
    };

    this.broadcast(
      new Set(
        chat.participants.filter(
          (participant) => includeSender || participant !== message.sender,
        ),
      ),
      payload,
    );
  }

  // MARK: - Private Methods
  private message(user: UserUUID, payload: WsResponse): void {
    const userSocket = this.socketForUser.get(user);

    if (userSocket === undefined || userSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    userSocket.send(JSON.stringify(payload));
  }

  private broadcast(users: Set<UserUUID>, payload: WsResponse): void {
    for (const user of users) {
      this.message(user, payload);
    }
  }

  private async getChat(uuid: ChatUUID): Promise<Chat> {
    // @TODO: add caching mechanism to reduce number of DB calls
    const chat = await this.service.getChat(uuid);

    if (!chat) {
      throw new WsException(ChatGatewayException.ChatNotFound);
    }

    return chat;
  }
}
