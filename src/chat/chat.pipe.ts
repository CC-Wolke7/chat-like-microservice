import {
  ArgumentMetadata,
  Inject,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { ProviderToken } from '../provider';
import { Chat, ChatStorageProvider } from './interfaces/storage';

@Injectable()
export class ChatByUUIDPipe implements PipeTransform {
  // MAKR: - Private Properties
  private readonly chatStorage: ChatStorageProvider;

  // MAKR: - Initialization
  constructor(
    @Inject(ProviderToken.CHAT_STORAGE) chatStorage: ChatStorageProvider,
  ) {
    this.chatStorage = chatStorage;
  }

  // MAKR: - Public Methods
  async transform(value: string, metadata: ArgumentMetadata): Promise<Chat> {
    const chats = await this.chatStorage.findChats(
      (chat) => chat.uuid == value,
    );

    if (chats.length == 0) {
      throw new NotFoundException();
    }

    return chats[0];
  }
}

@Injectable()
export class IsChatParticipantGuard implements PipeTransform {
  transform(value: Chat, metadata: ArgumentMetadata): Chat {
    return value as any;
  }
}
