import { Module, Provider } from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatStorage } from './chat.storage';

const ChatStorageProvider: Provider = {
  provide: ProviderToken.CHAT_STORAGE,
  useClass: ChatStorage,
};

const ChatNotificationProvider: Provider = {
  provide: ProviderToken.CHAT_NOTIFIER,
  useClass: ChatGateway,
};

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    ChatStorageProvider,
    ChatNotificationProvider,
  ],
})
export class ChatModule {}
