import { Module, Provider } from '@nestjs/common';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatStorage } from './chat.storage';
import { ChatStorageMock } from './__mocks__/chat.storage';

const ChatStorageProvider: Provider = {
  provide: ProviderToken.CHAT_STORAGE,
  useClass: process.env.NODE_ENV === 'test' ? ChatStorageMock : ChatStorage,
};

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatStorageProvider],
})
export class ChatModule {}
