import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  CreateChatPayload,
  CreateMessagePayload,
} from '../src/chat/interfaces/dto';
import { Chat, ChatMessage } from '../src/chat/interfaces/storage';
import { equalSet, isValidUUID } from '../src/util/helper';

describe('ChatController (e2e)', () => {
  // MARK: - Properties
  let app: INestApplication;
  const authenticatedUser = '84086a8b-9479-44f7-8ad1-73fc1ae3d8ef';

  // MARK: - Setup
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // MARK: - Tests
  it('/chats (POST) - fails if no payload is supplied', () => {
    return request(app.getHttpServer()).post('/chats').expect(400);
  });

  it('/chats (POST) - fails if `participants` is not a list', () => {
    const payload: CreateChatPayload = {
      participants: '12' as any,
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - fails if `participants` is not a list of UUIDs', () => {
    const payload: CreateChatPayload = {
      participants: ['12', 3, '34'] as any,
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - fails if list of `participants` is empty', () => {
    const payload: CreateChatPayload = {
      participants: [],
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - fails if `participants` are not unique', () => {
    const payload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
      ],
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - succeeds if `participants` are unique and returns newly created chat in list of chats', async () => {
    // Succeeds if participants are unique
    const payload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
      ],
    };

    const createChatResponse = await request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(201);

    const chat = createChatResponse.body as Chat;

    const keys = Object.keys(chat);
    const expectedKeys = ['uuid', 'creator', 'participants'];

    expect(keys.length).toEqual(expectedKeys.length);
    expect(equalSet(new Set(keys), new Set(expectedKeys))).toBeTruthy();

    expect(isValidUUID(chat.uuid, 4)).toBeTruthy();
    expect(chat.creator).toEqual(authenticatedUser);
    expect(chat.participants).toEqual([
      authenticatedUser,
      'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
      '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
    ]); // creator listed first

    // Returns newly created chat in list of chats
    return request(app.getHttpServer())
      .get('/chats')
      .expect(200)
      .expect([chat]);
  });

  it('/chats (POST) - succeeds if `participants` include creator', async () => {
    const payload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
        authenticatedUser,
      ],
    };

    const createChatResponse = await request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(201);

    const chat = createChatResponse.body as Chat;

    return expect(chat.participants).toEqual([
      authenticatedUser,
      'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
      '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
    ]); // creator listed first
  });

  it('/chats (POST) - fails if chat with same `participants` already exists', async () => {
    const payload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
      ],
    };

    await request(app.getHttpServer()).post('/chats').send(payload).expect(201);

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(409);
  });

  it('/chat/:chatId/messages (GET) - fails if `chatId` is not a UUID', () => {
    return request(app.getHttpServer())
      .get('/chat/chat-1/messages')
      .expect(400);
  });

  it('/chat/:chatId/messages (GET) - fails if chat with `chatId` does not exist', () => {
    return request(app.getHttpServer())
      .get('/chat/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/messages')
      .expect(404);
  });

  it('/chat/:chatId/messages (GET) - succeeds if chat with `chatId` exists', async () => {
    const payload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
      ],
    };

    const createChatResponse = await request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(201);

    const chat = createChatResponse.body as Chat;

    return request(app.getHttpServer())
      .get(`/chat/${chat.uuid}/messages`)
      .expect(200)
      .expect([]);
  });

  it('/chat/:chatId/messages (POST) - fails if `chatId` is not a UUID', () => {
    return request(app.getHttpServer())
      .post('/chat/chat-1/messages')
      .expect(400);
  });

  it('/chat/:chatId/messages (POST) - fails if no payload is supplied', () => {
    return request(app.getHttpServer())
      .post('/chat/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/messages')
      .expect(400);
  });

  it('/chat/:chatId/messages (POST) - fails if chat `message` is not a string', () => {
    const payload: CreateMessagePayload = {
      message: 12 as any,
    };

    return request(app.getHttpServer())
      .post('/chat/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/messages')
      .send(payload)
      .expect(400);
  });

  it('/chat/:chatId/messages (POST) - fails if chat with `chatId` does not exist', () => {
    const payload: CreateMessagePayload = {
      message: 'hello',
    };

    return request(app.getHttpServer())
      .post('/chat/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/messages')
      .send(payload)
      .expect(404);
  });

  it('/chat/:chatId/messages (POST) - succeeds if chat with `chatId` exists', async () => {
    const createChatPayload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
      ],
    };

    const createChatResponse = await request(app.getHttpServer())
      .post('/chats')
      .send(createChatPayload)
      .expect(201);

    const chat = createChatResponse.body as Chat;

    // Succeeds if chat with `chatId` exists
    const createMessagePayload: CreateMessagePayload = {
      message: 'hello',
    };

    const createMessageResponse = await request(app.getHttpServer())
      .post(`/chat/${chat.uuid}/messages`)
      .send(createMessagePayload)
      .expect(201);

    const message = createMessageResponse.body as ChatMessage;

    expect(isValidUUID(message.uuid, 4)).toBeTruthy();
    expect(message.chat).toEqual(chat.uuid);
    expect(message.sender).toEqual(authenticatedUser);
    // expect(message.date).toBe(expect.any(Date));
    expect(message.body).toEqual(createMessagePayload.message);

    // Returns newly created message in list of messages for chat
    return request(app.getHttpServer())
      .get(`/chat/${chat.uuid}/messages`)
      .expect(200)
      .expect([message]);
  });
});
