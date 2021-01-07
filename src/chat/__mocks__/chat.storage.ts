import { Injectable } from '@nestjs/common';
import { ChatStorageProvider, Chat, ChatMessage } from '../interfaces/storage';
import { v4 as uuidv4 } from 'uuid';
// import { CHATS, CHAT_MESSAGES } from './data';

@Injectable()
export class ChatStorageMock implements ChatStorageProvider {
  // MARK: - Private Properties
  private chats: Chat[] = []; // = CHATS;
  private messages: ChatMessage[] = []; // = CHAT_MESSAGES;

  // MARK: - Public Properties
  async findChats(filter: (chat: Chat) => boolean): Promise<Chat[]> {
    return this.chats.filter(filter);
  }

  async createChat(payload: Omit<Chat, 'uuid'>): Promise<Chat> {
    const uuid = uuidv4();
    const chat: Chat = { ...payload, uuid };

    this.chats.push(chat);

    return chat;
  }

  async findMessages(
    filter: (message: ChatMessage) => boolean,
  ): Promise<ChatMessage[]> {
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
}
