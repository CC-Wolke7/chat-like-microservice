import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatStorageMock } from './__mocks__/chat.storage';

describe('ChatController', () => {
  // MARK: - Properties
  let chatController: ChatController;

  // MARK: - Setup
  beforeEach(async () => {
    const ChatStorageProvider: Provider = {
      provide: ProviderToken.CHAT_STORAGE,
      useClass: ChatStorageMock,
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [ChatService, ChatStorageProvider],
    }).compile();

    chatController = app.get<ChatController>(ChatController);
  });

  // MARK: - Routes
  describe('chats', () => {
    it('should return chats from storage', async () => {
      expect(await chatController.getChats()).toEqual([]);
    });
  });
});
