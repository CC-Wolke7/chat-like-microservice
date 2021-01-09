import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import {
  CreateChatPayload,
  CreateMessagePayload,
  GetChatsQuery,
} from './interfaces/dto';
import { Chat, ChatMessage } from './interfaces/storage';
import { ServiceTokenGuard } from '../auth/service-token/service-token.guard';
import { User } from '../auth/user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/user';
import { RecommenderBot } from '../auth/interfaces/service-account';
import { ChatByUUIDPipe } from './chat.pipe';

// @TODO: add JWT & recommender bot guard
@UseGuards(ServiceTokenGuard)
@Controller()
export class ChatController {
  // MARK: - Private Properties
  private readonly chatService: ChatService;

  // MARK: - Initialization
  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  // MARK: - Routes
  @Get('chats')
  async getChats(
    @Query() query: GetChatsQuery,
    @User() user: AuthenticatedUser,
  ): Promise<Chat[]> {
    return await this.chatService.getChats(
      user.uuid,
      new Set(query.participants),
    );
  }

  @Post('chats')
  async createChat(
    @Body() payload: CreateChatPayload,
    @User() user: AuthenticatedUser | RecommenderBot,
  ): Promise<Chat> {
    return this.chatService.createChat(user, new Set(payload.participants));
  }

  @Get('chat/:chatId/messages')
  async getMessages(
    @Param('chatId', ParseUUIDPipe, ChatByUUIDPipe) chat: Chat,
    @User() user: AuthenticatedUser,
  ): Promise<ChatMessage[]> {
    this.chatService.checkParticipation(chat, user.uuid);

    return this.chatService.getMessages(chat.uuid);
  }

  @Post('chat/:chatId/messages')
  async sendMessage(
    @Param('chatId', ParseUUIDPipe, ChatByUUIDPipe) chat: Chat,
    @Body() payload: CreateMessagePayload,
    @User() user: AuthenticatedUser | RecommenderBot,
  ): Promise<ChatMessage> {
    this.chatService.checkParticipation(chat, user.uuid);

    return this.chatService.createMesage(chat.uuid, user, payload.message);
  }

  @Get('chat')
  chat(): void {
    // @TODO: upgrade to websocket
  }
}
