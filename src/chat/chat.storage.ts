import { Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  ChatModel,
  ChatMessageModel,
  ChatFilter,
  ChatMessageFilter,
} from './interfaces/storage';

// @TODO: connect to Google Firestore
@Injectable()
export class ChatStorage implements ChatStorageProvider {
  // MARK: - Public Properties
  async findChat(filter: ChatFilter): Promise<ChatModel | undefined> {
    throw new Error('not implemented');
  }

  async findChats(filter: ChatFilter): Promise<ChatModel[]> {
    throw new Error('not implemented');
  }

  async createChat(payload: Omit<ChatModel, 'uuid'>): Promise<ChatModel> {
    throw new Error('not implemented');
  }

  async findMessage(
    filter: ChatMessageFilter,
  ): Promise<ChatMessageModel | undefined> {
    throw new Error('not implemented');
  }

  async findMessages(filter: ChatMessageFilter): Promise<ChatMessageModel[]> {
    throw new Error('not implemented');
  }

  async createMessage(
    payload: Omit<ChatMessageModel, 'uuid'>,
  ): Promise<ChatMessageModel> {
    throw new Error('not implemented');
  }
}
