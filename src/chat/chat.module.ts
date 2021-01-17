import { DynamicModule, Provider, Type } from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './chat.service';
import { FirestoreChatStorage } from './storage/firestore/firestore-chat.storage';
import { AuthModule } from '../app/auth/auth.module';
import { ConfigModule } from '../app/config/config.module';
import { InMemoryChatStorage } from './storage/memory/memory-chat.storage';
import { PluginFactory } from '../plugins';

export enum ChatStorageProviderType {
  InMemory = 'memory',
  Firestore = 'firestore',
}

const CLASS_FOR_CHAT_STORAGE_PROVIDER_TYPE: Record<
  ChatStorageProviderType,
  Type<any>
> = {
  [ChatStorageProviderType.InMemory]: InMemoryChatStorage,
  [ChatStorageProviderType.Firestore]: FirestoreChatStorage,
};

interface ChatFactoryOptions {
  storage: ChatStorageProviderType;
}

export class ChatModuleFactory implements PluginFactory {
  // MARK: - Public Methods
  create(options?: ChatFactoryOptions): DynamicModule {
    const storageProvider = this.getStorageProvider(
      options?.storage ?? ChatStorageProviderType.InMemory,
    );

    const notificationProvider: Provider = {
      provide: ProviderToken.CHAT_NOTIFIER,
      useClass: ChatGateway,
    };

    return {
      module: ChatModule,
      imports: [AuthModule, ConfigModule],
      controllers: [ChatController],
      providers: [
        ChatService,
        storageProvider,
        notificationProvider,
        // ChatGateway, // uncomment if different CHAT_NOTIFIER is used, otherwise this will be instantiated twice
      ],
    };
  }

  // MARK: - Private Methods
  private getStorageProvider(type: ChatStorageProviderType): Provider {
    return {
      provide: ProviderToken.CHAT_STORAGE,
      useClass: CLASS_FOR_CHAT_STORAGE_PROVIDER_TYPE[type],
    };
  }
}

class ChatModule {}
