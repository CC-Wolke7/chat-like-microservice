import {
  ArgumentMetadata,
  Inject,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatException } from './chat.exception';
import { ChatModel, ChatStorageProvider } from './interfaces/storage';

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
  async transform(
    uuid: string,
    metadata: ArgumentMetadata,
  ): Promise<ChatModel> {
    const chat = await this.chatStorage.getChat(uuid);

    if (!chat) {
      throw new NotFoundException(ChatException.ChatNotFound);
    }

    return chat;
  }
}
