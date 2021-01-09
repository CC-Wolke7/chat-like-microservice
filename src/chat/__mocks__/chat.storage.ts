import { Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  Chat,
  ChatMessage,
  ChatFilter,
  ChatMessageFilter,
} from '../interfaces/storage';
import { v4 as uuidv4 } from 'uuid';
// import { CHATS, CHAT_MESSAGES } from './data';

@Injectable()
export class ChatStorageMock implements ChatStorageProvider {
  // MARK: - Private Properties
  private chats: Chat[] = []; // = CHATS;
  private messages: ChatMessage[] = []; // = CHAT_MESSAGES;

  // MARK: - Public Methods
  // MARK: Chat Storage Provider
  async findChat(filter: ChatFilter): Promise<Chat | undefined> {
    const chats = await this.findChats(filter);

    return this.getFirstOrNone(chats);
  }

  async findChats(filter: (chat: Chat) => boolean): Promise<Chat[]> {
    return this.chats.filter(filter);
  }

  async createChat(payload: Omit<Chat, 'uuid'>): Promise<Chat> {
    const uuid = uuidv4();
    const chat: Chat = { ...payload, uuid };

    this.chats.push(chat);

    return chat;
  }

  async findMessage(
    filter: ChatMessageFilter,
  ): Promise<ChatMessage | undefined> {
    const messages = await this.findMessages(filter);

    return this.getFirstOrNone(messages);
  }

  async findMessages(filter: ChatMessageFilter): Promise<ChatMessage[]> {
    return this.messages.filter(filter);
  }

  async createMessage(
    payload: Omit<ChatMessage, 'uuid'>,
  ): Promise<ChatMessage> {
    const uuid = uuidv4();
    const message: ChatMessage = { ...payload, uuid };

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
