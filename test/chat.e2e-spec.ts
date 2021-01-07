import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateChatPayload } from '../src/chat/interfaces/dto';
import { Chat } from '../src/chat/interfaces/storage';
import * as uuid from 'uuid';

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
  it('/chats (POST) - fails if participants is not a list', () => {
    const payload: CreateChatPayload = {
      participants: '12' as any,
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - fails if participants is not a list of UUIDs', () => {
    const payload: CreateChatPayload = {
      participants: ['12', 3, '34'] as any,
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - fails if list of participants is empty', () => {
    const payload: CreateChatPayload = {
      participants: [],
    };

    return request(app.getHttpServer())
      .post('/chats')
      .send(payload)
      .expect(400);
  });

  it('/chats (POST) - fails if participants are not unique', () => {
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

  it('/chats (POST) - succeeds if participants are unique and returns newly created chat in list of chats', async () => {
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

    expect(uuid.validate(chat.uuid)).toBeTruthy();
    expect(uuid.version(chat.uuid)).toEqual(4);
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

  it('/chats (POST) - succeeds if participants include creator', async () => {
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

  it('/chats (POST) - fails if chat with same participants already exists', async () => {
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

  // it('/chat/chat-1/messages (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/chat/chat-1/messages')
  //     .expect(400);
  // });
});
