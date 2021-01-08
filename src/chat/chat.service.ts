import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { assert } from 'console';
import { RecommenderBot } from '../auth/interfaces/service-account';
import { AuthenticatedUser } from '../auth/interfaces/user';
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

  async createChat(
    creator: AuthenticatedUser | RecommenderBot,
    participants: UserUUID[],
  ): Promise<Chat> {
    const allParticipants = new Set([creator.uuid, ...participants]);

    const existingChats = await this.storage.findChats((chat) => {
      return equalSet(new Set(chat.participants), allParticipants);
    });

    assert(existingChats.length <= 1);

    if (existingChats.length > 0) {
      throw new ConflictException();
    }

    return this.storage.createChat({
      creator: creator.uuid,
      participants: Array.from(allParticipants),
    });

    // @TODO: broadcast via websocket
  }

  async getMessages(chat: ChatUUID): Promise<ChatMessage[]> {
    return this.storage.findMessages((message) => message.chat === chat);
  }

  async createMesage(
    chat: ChatUUID,
    sender: AuthenticatedUser | RecommenderBot,
    message: string,
  ): Promise<ChatMessage> {
    return this.storage.createMessage({
      chat,
      sender: sender.uuid,
      date: new Date(),
      body: message,
    });

    // @TODO: broadcast via websocket
  }

  checkParticipation(chat: Chat, user: UserUUID): void {
    if (!chat.participants.includes(user)) {
      throw new ForbiddenException();
    }
  }
}
