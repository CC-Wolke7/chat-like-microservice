import { Injectable } from '@nestjs/common';
import {
  ChatStorageProvider,
  ChatModel,
  ChatMessageModel,
  ChatUUID,
  ChatMessageUUID,
  ChatPrototype,
  ChatMessagePrototype,
  UserUUID,
} from '../interfaces/storage';
import { v4 as uuidv4 } from 'uuid';
import { equalSet } from '../../util/helper';
// import { CHATS, CHAT_MESSAGES } from './data';

type ChatFilter = (chat: ChatModel) => boolean;
type ChatMessageFilter = (message: ChatMessageModel) => boolean;

@Injectable()
export class ChatStorageMock implements ChatStorageProvider {
  // MARK: - Private Properties
  private chats: ChatModel[] = []; // = CHATS;
  private messages: ChatMessageModel[] = []; // = CHAT_MESSAGES;

  // MARK: - Public Methods
  // MARK: Chat
  async getChat(uuid: ChatUUID): Promise<ChatModel | undefined> {
    return this.findChat((chat) => chat.uuid === uuid);
  }

  async createChat(payload: ChatPrototype): Promise<ChatModel> {
    const uuid = uuidv4();
    const chat: ChatModel = { ...payload, uuid };

    this.chats.push(chat);

    return chat;
  }

  async findChatsByParticipants(
    participants: Set<UserUUID>,
    strictEqual: boolean,
  ): Promise<ChatModel[]> {
    if (strictEqual) {
      return this.findChats((chat) => {
        return equalSet(new Set(chat.participants), participants);
      });
    } else {
      return this.findChats((chat) =>
        Array.from(participants).every((participant) =>
          chat.participants.includes(participant),
        ),
      );
    }
  }

  async findChat(filter: ChatFilter): Promise<ChatModel | undefined> {
    const chats = await this.findChats(filter);

    return this.getFirstOrNone(chats);
  }

  async findChats(filter: (chat: ChatModel) => boolean): Promise<ChatModel[]> {
    return this.chats.filter(filter);
  }

  // MARK: Message
  async getMessage(
    uuid: ChatMessageUUID,
  ): Promise<ChatMessageModel | undefined> {
    return this.findMessage((message) => message.uuid === uuid);
  }

  async createMessage(
    payload: ChatMessagePrototype,
  ): Promise<ChatMessageModel> {
    const uuid = uuidv4();
    const message: ChatMessageModel = { ...payload, uuid };

    this.messages.push(message);

    return message;
  }

  async findMessagesByChat(chat: ChatUUID): Promise<ChatMessageModel[]> {
    return this.findMessages((message) => message.chat === chat);
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

  // MARK: - Private Methods
  private getFirstOrNone<T>(items: T[]): T | undefined {
    if (items.length === 0) {
      return undefined;
    }

    return items[0];
  }
}
