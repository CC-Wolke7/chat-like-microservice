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
import { HttpAdapterHost } from '@nestjs/core';
import * as http from 'http';
import { AuthenticatedWsGateway } from '../../util/AuthenticatedWsGateway';

// @TODO: abstract chat rooms - https://github.com/afertil/nest-chat-api
// @TODO: detect broken/closed connections via ping/pong - https://github.com/websockets/ws#how-to-detect-and-close-broken-connections

// @TODO: configure path and remove socket.io reference
// console.log(server);

type AuthenticatedWebSocket = WebSocket & {
  user: ServiceAccountUser;
};

@WebSocketGateway()
export class ChatGateway
  extends AuthenticatedWsGateway<ServiceAccountUser>
  implements OnGatewayDisconnect<WebSocket>, ChatNotificationProvider {
  // MARK: - Private Properties
  private readonly service: ChatService;

  private readonly socketForUser = new Map<
    UserUUID,
    AuthenticatedWebSocket | undefined
  >();

  // MARK: - Initialization
  constructor(adapterHost: HttpAdapterHost, service: ChatService) {
    super(adapterHost);

    this.service = service;
  }

  // MARK: - Public Methods
  // MARK: AuthenticatedWsGateway
  async verifyUser(
    request: http.IncomingMessage,
  ): Promise<ServiceAccountUser | undefined> {
    // @TODO: https://github.com/nestjs/nest/issues/882#issuecomment-653237579
    // @TODO: retrieve user by headers
    const user: ServiceAccountUser = {
      type: UserType.ServiceAccount,
      name: ServiceAccountName.UnitTest,
      uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
    };

    return user;
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
