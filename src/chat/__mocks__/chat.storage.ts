import { Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  ChatModel,
  ChatMessageModel,
  ChatFilter,
  ChatMessageFilter,
} from '../interfaces/storage';
import { v4 as uuidv4 } from 'uuid';
// import { CHATS, CHAT_MESSAGES } from './data';

@Injectable()
export class ChatStorageMock implements ChatStorageProvider {
  // MARK: - Private Properties
  private chats: ChatModel[] = []; // = CHATS;
  private messages: ChatMessageModel[] = []; // = CHAT_MESSAGES;

  // MARK: - Public Methods
  // MARK: Chat Storage Provider
  async findChat(filter: ChatFilter): Promise<ChatModel | undefined> {
    const chats = await this.findChats(filter);

    return this.getFirstOrNone(chats);
  }

  async findChats(filter: (chat: ChatModel) => boolean): Promise<ChatModel[]> {
    return this.chats.filter(filter);
  }

  async createChat(payload: Omit<ChatModel, 'uuid'>): Promise<ChatModel> {
    const uuid = uuidv4();
    const chat: ChatModel = { ...payload, uuid };

    this.chats.push(chat);

    return chat;
  }

  async findMessage(
    filter: ChatMessageFilter,
  ): Promise<ChatMessageModel | undefined> {
    const messages = await this.findMessages(filter);

    return this.getFirstOrNone(messages);
  }

  async findMessages(filter: ChatMessageFilter): Promise<ChatMessageModel[]> {
    return this.messages.filter(filter);
  }

  async createMessage(
    payload: Omit<ChatMessageModel, 'uuid'>,
  ): Promise<ChatMessageModel> {
    const uuid = uuidv4();
    const message: ChatMessageModel = { ...payload, uuid };

    this.messages.push(message);

    return message;
  }

  // MARK: - Private Methods
  private getFirstOrNone<T>(items: T[]): T | undefined {
    if (items.length === 0) {
      return undefined;
    }

    return items[0];
  }
}
