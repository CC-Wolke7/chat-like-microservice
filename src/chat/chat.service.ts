import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { assert } from 'console';
import { ProviderToken } from '../provider';
import { equalSet } from '../util/helper';
import {
  ChatStorageProvider,
  UserUUID,
  Chat,
  ChatUUID,
  ChatMessage,
} from './interfaces/storage';

@Injectable()
export class ChatService {
  // MARK: - Private Properties
  private readonly storage: ChatStorageProvider;

  // MARK: - Initialization
  constructor(
    @Inject(ProviderToken.CHAT_STORAGE) storage: ChatStorageProvider,
  ) {
    this.storage = storage;
  }

  // MARK: - Public Methods
  async getChats(user: UserUUID): Promise<Chat[]> {
    return this.storage.findChats((chat) => chat.participants.includes(user));
  }

  async createChat(creator: UserUUID, participants: UserUUID[]): Promise<Chat> {
    const allParticipants = new Set([creator, ...participants]);

    const existingChats = await this.storage.findChats((chat) => {
      return equalSet(new Set(chat.participants), allParticipants);
    });

    assert(existingChats.length <= 1);

    if (existingChats.length > 0) {
      throw new ConflictException();
    }

    // @TODO: notify via websocket
    return this.storage.createChat({
      creator,
      participants: Array.from(allParticipants),
    });
  }

  async getMessages(chat: ChatUUID): Promise<ChatMessage[]> {
    return this.storage.findMessages((message) => message.chat == chat);
  }

  async createMesage(
    chat: ChatUUID,
    sender: UserUUID,
    message: string,
  ): Promise<ChatMessage> {
    // @TODO: notify via websocket
    return this.storage.createMessage({
      chat,
      sender,
      date: new Date(),
      body: message,
    });
  }
}
