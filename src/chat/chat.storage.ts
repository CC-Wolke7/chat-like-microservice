import { Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  Chat,
  ChatMessage,
  ChatFilter,
  ChatMessageFilter,
} from './interfaces/storage';

@Injectable()
export class ChatStorage implements ChatStorageProvider {
  // MARK: - Public Properties
  async findChat(filter: ChatFilter): Promise<Chat | undefined> {
    throw new Error('not implemented');
  }

  async findChats(filter: ChatFilter): Promise<Chat[]> {
    throw new Error('not implemented');
  }

  async createChat(payload: Omit<Chat, 'uuid'>): Promise<Chat> {
    throw new Error('not implemented');
  }

  async findMessage(
    filter: ChatMessageFilter,
  ): Promise<ChatMessage | undefined> {
    throw new Error('not implemented');
  }

  async findMessages(filter: ChatMessageFilter): Promise<ChatMessage[]> {
    throw new Error('not implemented');
  }

  async createMessage(
    payload: Omit<ChatMessage, 'uuid'>,
  ): Promise<ChatMessage> {
    throw new Error('not implemented');
  }
}
