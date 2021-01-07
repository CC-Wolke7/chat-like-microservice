import { Injectable } from '@nestjs/common';
import { ChatStorageProvider, Chat, ChatMessage } from './interfaces/storage';

@Injectable()
export class ChatStorage implements ChatStorageProvider {
  // MARK: - Public Properties
  async findChats(filter: (chat: Chat) => boolean): Promise<Chat[]> {
    throw new Error('not implemented');
  }

  async createChat(payload: Omit<Chat, 'uuid'>): Promise<Chat> {
    throw new Error('not implemented');
  }

  async findMessages(
    filter: (message: ChatMessage) => boolean,
  ): Promise<ChatMessage[]> {
    throw new Error('not implemented');
  }

  async createMessage(
    payload: Omit<ChatMessage, 'uuid'>,
  ): Promise<ChatMessage> {
    throw new Error('not implemented');
  }
}
