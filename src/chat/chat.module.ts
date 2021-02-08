import { DynamicModule, Provider, Type } from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './chat.service';
import { AuthModule } from '../app/auth/auth.module';
import { ConfigModule } from '../app/config/config.module';
import { ChatStorageProviderType } from './chat.storage';
import { FirestoreChatStorage } from './storage/firestore/firestore-chat.storage';
import { InMemoryChatStorage } from './storage/memory/memory-chat.storage';
import { PluginFactory } from '../plugins';
import { RedisBroker } from './gateway/broker/redis-broker';
import { MessageBrokerProvider } from './gateway/interfaces/broker';

export const CLASS_FOR_CHAT_STORAGE_PROVIDER_TYPE: Record<
  ChatStorageProviderType,
  Type<any>
> = {
  [ChatStorageProviderType.InMemory]: InMemoryChatStorage,
  [ChatStorageProviderType.Firestore]: FirestoreChatStorage,
};

export interface ChatFactoryOptions {
  storage: ChatStorageProviderType;
  brokerMode: boolean;
}

export class ChatModuleFactory implements PluginFactory {
  // MARK: - Public Methods
  create(options: ChatFactoryOptions): DynamicModule {
    const storageProvider = this.getStorageProvider(options.storage);

    const notificationProvider: Provider = options.brokerMode
      ? {
          provide: ProviderToken.CHAT_NOTIFIER,
          useClass: ChatGateway,
        }
      : {
          provide: ProviderToken.CHAT_NOTIFIER,
          useValue: undefined,
        };

    const brokerProvider: Provider<
      MessageBrokerProvider | undefined
    > = options.brokerMode
      ? {
          provide: ProviderToken.CHAT_BROKER,
          useClass: RedisBroker,
        }
      : {
          provide: ProviderToken.CHAT_BROKER,
          useValue: undefined,
        };

    return {
      module: ChatModule,
      imports: [AuthModule, ConfigModule],
      controllers: [ChatController],
      providers: [
        ChatService,
        storageProvider,
        notificationProvider,
        brokerProvider,
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
