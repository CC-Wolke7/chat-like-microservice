import {
  Body,
  Controller,
  Get,
  Inject,
  Optional,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService, ChatServiceUser } from './chat.service';
import {
  CreateChatPayload,
  CreateMessagePayload,
  GetChatsQuery,
  GetChatsResponse,
  CreateChatMessageResponse,
  GetChatMessagesResponse,
  CreateChatResponse,
} from './chat.dto';
import { ChatModel } from './interfaces/storage';
import { User } from '../app/auth/user.decorator';
import { ChatByUUIDPipe } from './chat.pipe';
import { ProviderToken } from '../provider';
import { ChatNotificationProvider } from './interfaces/notification';
import { ApiTags } from '@nestjs/swagger';
import {
  AndAuthGuard,
  OrAuthGuard,
  ServiceAccountUserGuard,
  ServiceTokenGuard,
  VetShelterAuthGuard,
} from '../app/auth/auth.guard';

@UseGuards(
  new OrAuthGuard(
    new AndAuthGuard(new ServiceTokenGuard(), new ServiceAccountUserGuard()),
    new VetShelterAuthGuard(),
  ),
)
@ApiTags('chat')
@Controller()
export class ChatController {
  // MARK: - Private Properties
  private readonly service: ChatService;
  private readonly notifier?: ChatNotificationProvider;

  // MARK: - Initialization
  constructor(
    service: ChatService,
    @Optional()
    @Inject(ProviderToken.CHAT_NOTIFIER)
    notifier?: ChatNotificationProvider,
  ) {
    this.service = service;
    this.notifier = notifier;
  }

  // MARK: - Routes
  @Get('chats')
  async getChats(
    @Query() query: GetChatsQuery,
    @User() user: ChatServiceUser,
  ): Promise<GetChatsResponse> {
    return await this.service.getChats(
      user.uuid,
      new Set(query.participants),
      query.strictEqual,
    );
  }

  @Post('chats')
  async createChat(
    @Body() payload: CreateChatPayload,
    @User() user: ChatServiceUser,
  ): Promise<CreateChatResponse> {
    const chat = await this.service.createChat(
      user,
      new Set(payload.participants),
    );

    await this.notifier?.notifyChatCreated(chat);

    return chat;
  }

  @Get('chat/:chatId/messages')
  async getMessages(
    @Param('chatId', ParseUUIDPipe, ChatByUUIDPipe) chat: ChatModel,
    @User() user: ChatServiceUser,
  ): Promise<GetChatMessagesResponse> {
    this.service.checkParticipation(chat, user.uuid);

    return this.service.getMessages(chat.uuid);
  }

  @Post('chat/:chatId/messages')
  async sendMessage(
    @Param('chatId', ParseUUIDPipe, ChatByUUIDPipe) chat: ChatModel,
    @Body() payload: CreateMessagePayload,
    @User() user: ChatServiceUser,
  ): Promise<CreateChatMessageResponse> {
    this.service.checkParticipation(chat, user.uuid);

    const message = await this.service.createMessage(
      chat.uuid,
      user,
      payload.message,
    );

    await this.notifier?.notifyMessageCreated(chat, message);

    return message;
  }
}
