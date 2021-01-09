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
import { ChatNotificationProvider } from './interfaces/notification';
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
  private readonly notifier: ChatNotificationProvider;

  // MARK: - Initialization
  constructor(
    @Inject(ProviderToken.CHAT_STORAGE) storage: ChatStorageProvider,
    @Inject(ProviderToken.CHAT_NOTIFIER) notifier: ChatNotificationProvider,
  ) {
    this.storage = storage;
    this.notifier = notifier;
  }

  // MARK: - Public Methods
  async getChats(
    user: UserUUID,
    participants?: Set<UserUUID>,
  ): Promise<Chat[]> {
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
  ): Promise<Chat> {
    const allParticipants = participants.add(creator.uuid);

    const existingChats = await this.storage.findChats((chat) => {
      return equalSet(new Set(chat.participants), allParticipants);
    });

    assert(existingChats.length <= 1);

    if (existingChats.length > 0) {
      throw new ConflictException();
    }

    const chat = await this.storage.createChat({
      creator: creator.uuid,
      participants: Array.from(allParticipants),
    });

    await this.notifier.notifyChatCreated(chat);

    return chat;
  }

  async getMessages(chat: ChatUUID): Promise<ChatMessage[]> {
    return this.storage.findMessages((message) => message.chat === chat);
  }

  async createMesage(
    chat: Chat,
    sender: AuthenticatedUser | RecommenderBot,
    body: string,
  ): Promise<ChatMessage> {
    const message = await this.storage.createMessage({
      chat: chat.uuid,
      sender: sender.uuid,
      date: new Date(),
      body,
    });

    await this.notifier.notifyMessageCreated(chat, message);

    return message;
  }

  checkParticipation(chat: Chat, user: UserUUID): void {
    if (!chat.participants.includes(user)) {
      throw new ForbiddenException();
    }
  }
}
