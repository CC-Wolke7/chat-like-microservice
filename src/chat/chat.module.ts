import { Module, Provider } from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { ChatService } from './chat.service';
import { FirestoreChatStorage } from './chat.storage';
import { AuthModule } from '../app/auth/auth.module';

const ChatStorageProvider: Provider = {
  provide: ProviderToken.CHAT_STORAGE,
  useClass: FirestoreChatStorage,
};

const ChatNotificationProvider: Provider = {
  provide: ProviderToken.CHAT_NOTIFIER,
  useClass: ChatGateway,
};

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    // ChatGateway, // uncomment if different CHAT_NOTIFIER is used, otherwise this will be instantiated twice
    ChatStorageProvider,
    ChatNotificationProvider,
  ],
})
export class ChatModule {}
