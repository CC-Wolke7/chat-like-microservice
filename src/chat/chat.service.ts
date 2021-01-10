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
  async getChat(uuid: ChatUUID): Promise<Chat | undefined> {
    return this.storage.findChat((chat) => chat.uuid === uuid);
  }

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

    return chat;
  }

  async getMessages(chat: ChatUUID): Promise<ChatMessage[]> {
    return this.storage.findMessages((message) => message.chat === chat);
  }

  async createMessage(
    chat: ChatUUID,
    sender: AuthenticatedUser | RecommenderBot,
    body: string,
  ): Promise<ChatMessage> {
    const message = await this.storage.createMessage({
      chat,
      sender: sender.uuid,
      date: new Date(),
      body,
    });

    return message;
  }

  checkParticipation(chat: Chat, user: UserUUID): void {
    if (!chat.participants.includes(user)) {
      // @TODO: move to global exception handler
      // throw new WsException(ChatGatewayException.Forbidden);
      throw new ForbiddenException();
    }
  }
}
