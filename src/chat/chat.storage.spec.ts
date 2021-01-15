import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreChatStorage } from './chat.storage';
import {
  ChatMessageModel,
  ChatModel,
  ChatPrototype,
} from './interfaces/storage';

describe('FirestoreChatStorage', () => {
  // MARK: - Properties
  let storage: FirestoreChatStorage;

  // MARK: - Hooks
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [FirestoreChatStorage],
    }).compile();

    storage = app.get<FirestoreChatStorage>(FirestoreChatStorage);

    await storage.reset();
  });

  afterEach(async () => {
    await storage.closeConnection();
  });

  // MARK: - Routes
  describe('chats', () => {
    it('should return `undefined` if chat does not exist', async () => {
      expect(await storage.getChat('1')).toEqual(undefined);
    });

    it('should store the chat with an auto generated uuid', async () => {
      const createChatPayload: Omit<ChatModel, 'uuid'> = {
        creator: 'nik',
        participants: ['arne', 'savina'],
      };

      const chat = await storage.createChat(createChatPayload);

      expect(chat.uuid).toEqual(expect.any(String));
      expect(chat.creator).toEqual(createChatPayload.creator);
      expect(chat.participants).toEqual(createChatPayload.participants);

      // Should be retrievable afterwards
      const storedChat = await storage.getChat(chat.uuid);

      expect(storedChat).toBeDefined();
      expect(storedChat!.uuid).toEqual(chat.uuid);
      expect(storedChat!.creator).toEqual(createChatPayload.creator);
      expect(storedChat!.participants).toEqual(createChatPayload.participants);
    });

    it('should return empty array if no messages exist for chat', async () => {
      expect(await storage.findMessagesByChat('chat-1')).toEqual([]);
    });

    it('should store the message with an auto generated uuid', async () => {
      const createMessagePayload: Omit<ChatMessageModel, 'uuid'> = {
        chat: 'chat-1',
        sender: 'nik',
        date: new Date(),
        body: 'hello',
      };

      const message = await storage.createMessage(createMessagePayload);

      expect(message.uuid).toEqual(expect.any(String));
      expect(message.chat).toEqual(createMessagePayload.chat);
      expect(message.sender).toEqual(createMessagePayload.sender);
      expect(message.date).toEqual(createMessagePayload.date);
      expect(message.body).toEqual(createMessagePayload.body);

      // Should be retrievable afterwards
      const storedMessage = await storage.getMessage(message.uuid);

      expect(storedMessage).toBeDefined();
      expect(storedMessage!.uuid).toEqual(message.uuid);
      expect(storedMessage!.chat).toEqual(createMessagePayload.chat);
      expect(storedMessage!.sender).toEqual(createMessagePayload.sender);
      // @TODO: serialize dates
      // expect(storedMessage!.date).toEqual(createMessagePayload.date);
      expect(storedMessage!.body).toEqual(createMessagePayload.body);

      // Should be added to list of messages for `chat-1`
      const chatMessages = await storage.findMessagesByChat(
        createMessagePayload.chat,
      );

      expect(chatMessages.length).toEqual(1);
    });

    it('can strictly filter chats by `participants`', async () => {
      const firstChatPrototype: ChatPrototype = {
        creator: 'nik',
        participants: [
          'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
          '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
        ],
      };

      const firstChat = await storage.createChat(firstChatPrototype);

      const secondChatPayload: ChatPrototype = {
        creator: 'klaus',
        participants: [
          'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
          '615a247b-e65a-4439-a43a-7fc3bebd869c',
          'b56ad0f5-9b48-4c5d-9cb2-edde65fc5d4d',
        ],
      };

      const secondChat = await storage.createChat(secondChatPayload);

      // Query for chats in which exactly only user `f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba` participates
      // returns zero results
      const firstQueryResult = await storage.findChatsByParticipants(
        new Set(['f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba']),
        true,
      );

      expect(firstQueryResult.length).toEqual(0);

      // Query for chats in which exactly only user `f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba`
      // and `615a247b-e65a-4439-a43a-7fc3bebd869c` participate returns one result
      const secondQueryResult = await storage.findChatsByParticipants(
        new Set([
          'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
          '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
        ]),
        true,
      );

      expect(secondQueryResult.length).toEqual(1);
      expect(secondQueryResult[0].uuid).toEqual(firstChat.uuid);

      // Query for chats in which exactly only user `f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba`,
      // `615a247b-e65a-4439-a43a-7fc3bebd869c` and 'b56ad0f5-9b48-4c5d-9cb2-edde65fc5d4d'
      // participate returns one result
      const thirdQueryResult = await storage.findChatsByParticipants(
        new Set([
          'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
          '615a247b-e65a-4439-a43a-7fc3bebd869c',
          'b56ad0f5-9b48-4c5d-9cb2-edde65fc5d4d',
        ]),
        true,
      );

      expect(thirdQueryResult.length).toEqual(1);
      expect(thirdQueryResult[0].uuid).toEqual(secondChat.uuid);
    });
  });

  it('can loosely filter chats by `participants`', async () => {
    const firstChatPrototype: ChatPrototype = {
      creator: 'nik',
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
      ],
    };

    const firstChat = await storage.createChat(firstChatPrototype);

    const secondChatPayload: ChatPrototype = {
      creator: 'klaus',
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '615a247b-e65a-4439-a43a-7fc3bebd869c',
        'b56ad0f5-9b48-4c5d-9cb2-edde65fc5d4d',
      ],
    };

    const secondChat = await storage.createChat(secondChatPayload);

    // Query for chats in which at leastly user `f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba` participates
    // returns zero results
    const firstQueryResult = await storage.findChatsByParticipants(
      new Set(['f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba']),
      false,
    );

    expect(firstQueryResult.length).toEqual(2);
    expect(new Set(firstQueryResult.map((chat) => chat.uuid))).toEqual(
      new Set([firstChat.uuid, secondChat.uuid]),
    );

    // Query for chats in which at least user `f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba`
    // and `615a247b-e65a-4439-a43a-7fc3bebd869c` participate returns one result
    const secondQueryResult = await storage.findChatsByParticipants(
      new Set([
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '615a247b-e65a-4439-a43a-7fc3bebd869c',
      ]),
      false,
    );

    expect(secondQueryResult.length).toEqual(1);
    expect(secondQueryResult[0].uuid).toEqual(secondChat.uuid);
  });
});
