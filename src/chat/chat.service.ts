import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { assert } from 'console';
import { ServiceAccountUser } from '../app/auth/interfaces/service-account';
import { AuthenticatedUser } from '../app/auth/interfaces/user';
import { ProviderToken } from '../provider';
import { ChatException } from './chat.exception';
import {
  ChatStorageProvider,
  UserUUID,
  ChatModel,
  ChatUUID,
  ChatMessageModel,
} from './interfaces/storage';

export type ChatServiceUser = AuthenticatedUser | ServiceAccountUser;

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
  async getChat(uuid: ChatUUID): Promise<ChatModel | undefined> {
    return this.storage.getChat(uuid);
  }

  async getChats(
    user: UserUUID,
    participants?: Set<UserUUID>,
  ): Promise<ChatModel[]> {
    const allParticipants =
      participants !== undefined ? participants.add(user) : new Set([user]);

    return this.storage.findChatsByParticipants(allParticipants, false);
  }

  async createChat(
    creator: ChatServiceUser,
    participants: Set<UserUUID>,
  ): Promise<ChatModel> {
    const allParticipants = participants.add(creator.uuid);

    const existingChats = await this.storage.findChatsByParticipants(
      allParticipants,
      true,
    );

    assert(existingChats.length <= 1);

    if (existingChats.length > 0) {
      throw new ConflictException(ChatException.ChatAlreadyExists);
    }

    const chat = await this.storage.createChat({
      creator: creator.uuid,
      participants: Array.from(allParticipants),
    });

    return chat;
  }

  async getMessages(chat: ChatUUID): Promise<ChatMessageModel[]> {
    return this.storage.findMessagesByChat(chat);
  }

  async createMessage(
    chat: ChatUUID,
    sender: ChatServiceUser,
    body: string,
  ): Promise<ChatMessageModel> {
    const message = await this.storage.createMessage({
      chat,
      sender: sender.uuid,
      date: new Date(),
      body,
    });

    return message;
  }

  checkParticipation(chat: ChatModel, user: UserUUID): void {
    if (!chat.participants.includes(user)) {
      throw new ForbiddenException(ChatException.NotParticipant);
    }
  }
}
