import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WsResponse,
  OnGatewayDisconnect,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatNotificationProvider } from '../interfaces/notification';
import {
  ChatModel,
  ChatMessageModel,
  ChatUUID,
  UserUUID,
} from '../interfaces/storage';
import * as WebSocket from 'ws';
import { ChatEvent } from './chat.gateway.event';
import {
  ServiceAccountUser,
  RecommenderBot,
} from '../../app/auth/interfaces/service-account';
import { CreateMessageEventPayload } from './chat.gateway.dto';
import { ChatService } from '../chat.service';
import { ChatException } from '../chat.exception';
import { HttpAdapterHost } from '@nestjs/core';
import * as http from 'http';
import { AuthenticatedWsGateway } from '../../util/AuthenticatedWsGateway';
import { ServiceTokenStrategy } from '../../app/auth/strategy/service-token/service-token.strategy';
import { UseFilters } from '@nestjs/common';
import { ChatGatewayExceptionFilter } from './chat.gateway.filter';

type User = ServiceAccountUser;

type AuthenticatedWebSocket = WebSocket & {
  user: User;
};

// @TODO: abstract chat rooms - https://github.com/afertil/nest-chat-api
// @TODO: detect broken/closed connections via ping/pong - https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
@UseFilters(new ChatGatewayExceptionFilter())
@WebSocketGateway()
export class ChatGateway
  extends AuthenticatedWsGateway<User>
  implements OnGatewayDisconnect<WebSocket>, ChatNotificationProvider {
  // MARK: - Private Properties
  private readonly service: ChatService;
  private readonly serviceTokenStrategy: ServiceTokenStrategy;

  private readonly socketForUser = new Map<
    UserUUID,
    AuthenticatedWebSocket | undefined
  >();

  // MARK: - Initialization
  constructor(
    adapterHost: HttpAdapterHost,
    service: ChatService,
    serviceTokenStrategy: ServiceTokenStrategy,
  ) {
    super(adapterHost);

    this.service = service;
    this.serviceTokenStrategy = serviceTokenStrategy;
  }

  // MARK: - Public Methods
  // MARK: AuthenticatedWsGateway
  async verifyUser(request: http.IncomingMessage): Promise<User | undefined> {
    // @TODO: add JWT & recommender bot guard
    const bearerToken = request.headers.authorization?.replace('Bearer ', '');

    if (!bearerToken) {
      return undefined;
    }

    return this.serviceTokenStrategy.validate(
      bearerToken,
    ) as ServiceAccountUser;
  }

  // MARK: Lifecycle
  handleConnection(
    socket: AuthenticatedWebSocket,
    request: http.IncomingMessage,
    user: User,
  ): void {
    socket.user = user;
    this.socketForUser.set(user.uuid, socket);
  }

  handleDisconnect(socket: AuthenticatedWebSocket): void {
    this.socketForUser.delete(socket.user.uuid);
  }

  // MARK: Event Handler
  @SubscribeMessage(ChatEvent.CreateMessage)
  async createMessage(
    @ConnectedSocket() socket: AuthenticatedWebSocket,
    @MessageBody() payload: CreateMessageEventPayload,
  ): Promise<void> {
    const user = socket.user;

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
  async notifyChatCreated(
    chat: ChatModel,
    includeCreator = true,
  ): Promise<void> {
    const payload: WsResponse<ChatModel> = {
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
    chat: ChatModel,
    message: ChatMessageModel,
    includeSender = true,
  ): Promise<void> {
    const payload: WsResponse<ChatMessageModel> = {
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

  private async getChat(uuid: ChatUUID): Promise<ChatModel> {
    // @TODO: add caching mechanism to reduce number of DB calls
    const chat = await this.service.getChat(uuid);

    if (!chat) {
      throw new WsException(ChatException.ChatNotFound);
    }

    return chat;
  }
}
