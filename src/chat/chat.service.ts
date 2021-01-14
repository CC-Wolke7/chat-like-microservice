import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { assert } from 'console';
import { RecommenderBot } from '../app/auth/interfaces/service-account';
import { AuthenticatedUser } from '../app/auth/interfaces/user';
import { ProviderToken } from '../provider';
import { equalSet } from '../util/helper';
import { ChatException } from './chat.exception';
import {
  ChatStorageProvider,
  UserUUID,
  ChatModel,
  ChatUUID,
  ChatMessageModel,
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
  async getChat(uuid: ChatUUID): Promise<ChatModel | undefined> {
    return this.storage.findChat((chat) => chat.uuid === uuid);
  }

  async getChats(
    user: UserUUID,
    participants?: Set<UserUUID>,
  ): Promise<ChatModel[]> {
    return this.storage.findChats(
      (chat) =>
        chat.participants.includes(user) &&
        (participants !== undefined
          ? Array.from(participants).every((participant) =>
              chat.participants.includes(participant),
            )
          : true),
    );
  }

  async createChat(
    creator: AuthenticatedUser | RecommenderBot,
    participants: Set<UserUUID>,
  ): Promise<ChatModel> {
    const allParticipants = participants.add(creator.uuid);

    const existingChats = await this.storage.findChats((chat) => {
      return equalSet(new Set(chat.participants), allParticipants);
    });

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
    return this.storage.findMessages((message) => message.chat === chat);
  }

  async createMessage(
    chat: ChatUUID,
    sender: AuthenticatedUser | RecommenderBot,
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
