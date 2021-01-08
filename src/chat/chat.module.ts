import { Module, Provider } from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatStorage } from './chat.storage';

// DI for `ChatStorageProvider` (interface)
const ChatStorageProvider: Provider = {
  provide: ProviderToken.CHAT_STORAGE,
  useClass: ChatStorage,
};

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatStorageProvider],
})
export class ChatModule {}
