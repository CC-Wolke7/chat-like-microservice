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
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatGatewayExceptionFilter } from './chat.gateway.filter';
import { BrokerMessage, MessageBrokerProvider } from './interfaces/broker';
import { ProviderToken } from '../../provider';
import { promisify } from 'util';
import { ChatGatewayException } from './chat.gateway.exception';

type User = ServiceAccountUser;

type AuthenticatedWebSocket = WebSocket & {
  user: User;
};

// @TODO: abstract chat rooms - https://github.com/afertil/nest-chat-api
// @TODO: detect broken/closed connections via ping/pong - https://github.com/websockets/ws#how-to-detect-and-close-broken-connections

// @NOTE: should match provider in root.module.ts
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@UseFilters(new ChatGatewayExceptionFilter())
@WebSocketGateway()
export class ChatGateway
  extends AuthenticatedWsGateway<User>
  implements OnGatewayDisconnect<WebSocket>, ChatNotificationProvider {
  // MARK: - Private Properties
  private readonly service: ChatService;
  private readonly serviceTokenStrategy: ServiceTokenStrategy;
  private readonly broker: MessageBrokerProvider;

  private readonly socketForUser = new Map<
    UserUUID,
    AuthenticatedWebSocket | undefined
  >();

  // MARK: - Initialization
  constructor(
    adapterHost: HttpAdapterHost,
    service: ChatService,
    serviceTokenStrategy: ServiceTokenStrategy,
    @Inject(ProviderToken.CHAT_BROKER) broker: MessageBrokerProvider,
  ) {
    super(adapterHost);

    this.service = service;
    this.serviceTokenStrategy = serviceTokenStrategy;

    this.broker = broker;
    this.broker.onMessage = this.onBrokerMessage.bind(this);
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

    return this.broadcast(
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

    return this.broadcast(
      new Set(
        chat.participants.filter(
          (participant) => includeSender || participant !== message.sender,
        ),
      ),
      payload,
    );
  }

  // MARK: - Private Methods
  private async message(user: UserUUID, payload: WsResponse): Promise<void> {
    const userSocket = this.socketForUser.get(user);

    if (userSocket === undefined) {
      throw new Error(ChatGatewayException.ParticipantNotConnected);
    }

    if (userSocket.readyState !== WebSocket.OPEN) {
      throw new Error(ChatGatewayException.ParticipantNotReady);
    }

    const send = promisify(userSocket.send).bind(userSocket);
    await send(JSON.stringify(payload));
  }

  private async broadcast(
    users: Set<UserUUID>,
    payload: WsResponse,
  ): Promise<void> {
    const disconnectedUsers: UserUUID[] = [];

    for (const user of users) {
      try {
        await this.message(user, payload);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === ChatGatewayException.ParticipantNotConnected) {
            disconnectedUsers.push(user);
          }

          // @TODO: handle retry
        }

        // @TODO: handle retry
      }
    }

    if (disconnectedUsers.length >= 1) {
      await this.broker.publishMessage({
        users: disconnectedUsers,
        payload,
      });
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

  private onBrokerMessage(message: BrokerMessage): void {
    const connectedUsers = message.users.filter(
      (user) => this.socketForUser.get(user) !== undefined,
    );

    for (const user of connectedUsers) {
      // @TODO: handle retry
      this.message(user, message.payload);
    }
  }
}
