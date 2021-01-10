import { Provider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ServiceAccountUser,
  ServiceAccountName,
} from '../app/auth/interfaces/service-account';
import { AuthenticatedUser, UserType } from '../app/auth/interfaces/user';
import { ProviderToken } from '../provider';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGatewayMock } from './__mocks__/chat.gateway';
import { ChatStorageMock } from './__mocks__/chat.storage';

describe('ChatController', () => {
  // MARK: - Properties
  let chatController: ChatController;

  const user: ServiceAccountUser = {
    type: UserType.ServiceAccount,
    name: ServiceAccountName.UnitTest,
    uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
  };

  // MARK: - Hooks
  beforeEach(async () => {
    const ChatStorageProvider: Provider = {
      provide: ProviderToken.CHAT_STORAGE,
      useClass: ChatStorageMock,
    };

    const ChatNotificationProvider: Provider = {
      provide: ProviderToken.CHAT_NOTIFIER,
      useClass: ChatGatewayMock,
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [ChatService, ChatStorageProvider, ChatNotificationProvider],
    }).compile();

    chatController = app.get<ChatController>(ChatController);
  });

  // MARK: - Routes
  describe('chats', () => {
    it('should return chats from storage', async () => {
      expect(
        await chatController.getChats(
          {},
          (user as unknown) as AuthenticatedUser,
        ),
      ).toEqual([]);
    });
  });
});
