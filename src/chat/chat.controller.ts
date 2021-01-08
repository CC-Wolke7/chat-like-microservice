import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatPayload, CreateMessagePayload } from './interfaces/dto';
import { Chat, ChatMessage } from './interfaces/storage';
import { ChatByUUIDPipe, IsChatParticipantGuard } from './chat.pipe';

@Controller()
export class ChatController {
  // MARK: - Public Properties

  // MARK: - Private Properties
  private readonly chatService: ChatService;

  // @TODO: read from request
  private authenticatedUser = '84086a8b-9479-44f7-8ad1-73fc1ae3d8ef';

  // MARK: - Initialization
  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  // MARK: - Routes
  @Get('chats')
  async getChats(): Promise<Chat[]> {
    return await this.chatService.getChats(this.authenticatedUser);
  }

  @Post('chats')
  async createChat(@Body() payload: CreateChatPayload): Promise<Chat> {
    const { participants } = payload;

    return this.chatService.createChat(this.authenticatedUser, participants);
  }

  @Get('chat/:chatId/messages')
  async getMessages(
    @Param('chatId', ParseUUIDPipe, ChatByUUIDPipe, IsChatParticipantGuard)
    chat: Chat,
  ): Promise<ChatMessage[]> {
    // @TODO: check whether authenticated user is participant in chat
    // throw new ForbiddenException();

    return this.chatService.getMessages(chat.uuid);
  }

  @Post('chat/:chatId/messages')
  async sendMessage(
    @Param('chatId', ParseUUIDPipe, ChatByUUIDPipe, IsChatParticipantGuard)
    chat: Chat,
    @Body() payload: CreateMessagePayload,
  ): Promise<ChatMessage> {
    // @TODO: check whether authenticated user is participant in chat
    // throw new ForbiddenException();

    const { message } = payload;

    return this.chatService.createMesage(
      chat.uuid,
      this.authenticatedUser,
      message,
    );
  }

  @Get('chat')
  chat(): void {
    // @TODO: upgrade to websocket
  }
}
