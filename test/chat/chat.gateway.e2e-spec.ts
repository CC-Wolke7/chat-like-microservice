import { ChatEvent } from '../../src/chat/gateway/chat.gateway.event';
import { WsResponse } from '@nestjs/websockets';
import { CreateChatPayload } from '../../src/chat/chat.dto';
import * as request from 'supertest';
import { PublicChat, PublicChatMessage } from './interfaces/chat';
import { CreateMessageEventPayload } from '../../src/chat/gateway/chat.gateway.dto';
import { isValidISODateString } from 'iso-datestring-validator';
import { equalSet } from '../../src/util/helper';
import {
  authenticateWebSocket,
  connectToWebsocket,
  CREATOR_SERVICE_TOKEN,
  INVALID_SERVICE_TOKEN,
  PARTICIPANT_SERVICE_TOKEN,
  REDIS_CLIENT_ID_1,
  REDIS_CLIENT_ID_2,
  setupChatWebsocketTest,
  stopWebsocketTest,
  TEST_SERVICE_ACCOUNT_CONFIG,
  NON_PARTICIPANT_SERVICE_TOKEN,
} from '../util/helper';
import * as WebSocket from 'ws';
import { ChatException } from '../../src/chat/chat.exception';
import { INestApplication } from '@nestjs/common';
import * as nock from 'nock';
import { CoreConfig } from '../../src/app/config/namespace/core.config';

describe('ChatGateway (e2e) [authenticated]', () => {
  // MARK: - Properties
  const SERVER_PORT = 4001;

  let server: any;
  let apps: INestApplication[];
  let sockets: WebSocket[];

  const {
    vetShelter,
    server: { hostname },
  } = CoreConfig();

  const chatCreator =
    TEST_SERVICE_ACCOUNT_CONFIG.accountForToken[CREATOR_SERVICE_TOKEN];

  // MARK: - Hooks
  beforeEach(async () => {
    const { server: newServer, app: newApp } = await setupChatWebsocketTest(
      SERVER_PORT,
      REDIS_CLIENT_ID_1,
      hostname,
    );
    server = newServer;
    apps = [newApp];
    sockets = [];
  });

  afterEach(async () => {
    await stopWebsocketTest(apps, sockets);

    // Cleanup prepared mocks (and associated state)
    nock.cleanAll();
  });

  afterAll(() => {
    // Restore HTTP interceptor to normal unmocked behaviour
    nock.restore();
  });

  // MARK: - Tests
  it('should connect', (done) => {
    const socket = connectToWebsocket(server, SERVER_PORT, hostname);

    sockets.push(socket);

    socket.on('open', () => {
      done();
    });
  });

  xit('should fail to authenticate', async (done) => {
    const verifyTokenMock = nock(vetShelter.apiUrl)
      .post('/api/token/verify')
      .reply(401);

    const socket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(socket);

    try {
      await authenticateWebSocket(socket, { token: INVALID_SERVICE_TOKEN });
    } catch {
      expect(verifyTokenMock.isDone()).toBeTruthy();
      done();
    }
  });

  it('should authenticate', async () => {
    const socket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(socket);

    await authenticateWebSocket(socket, { token: CREATOR_SERVICE_TOKEN });
  });

  it('`CREATE_MESSAGE` should fail if `chat` is not a UUID', async () => {
    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
    } as WsResponse<CreateMessageEventPayload>;

    const socket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(socket);

    await authenticateWebSocket(socket, { token: CREATOR_SERVICE_TOKEN });

    await new Promise<void>((resolve) => {
      socket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<ChatException>;

        expect(chatEvent.event).toEqual(ChatEvent.ChatError);
        expect(chatEvent.data).toEqual('Bad Request Exception');

        resolve();
      };

      socket.send(JSON.stringify(createMessageEvent));
    });
  });

  it('`CREATE_MESSAGE` should fail if `chat` is not a UUID', async () => {
    const createMessageEventPayload: CreateMessageEventPayload = {
      chat: 'chat-1',
      message: 'hello',
    };

    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
      data: createMessageEventPayload,
    };

    const socket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(socket);

    await authenticateWebSocket(socket, { token: CREATOR_SERVICE_TOKEN });

    await new Promise<void>((resolve) => {
      socket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<ChatException>;

        expect(chatEvent.event).toEqual(ChatEvent.ChatError);
        expect(chatEvent.data).toEqual('Bad Request Exception');

        resolve();
      };

      socket.send(JSON.stringify(createMessageEvent));
    });
  });

  it('`CREATE_MESSAGE` should fail if `message` is not a string', async () => {
    const createMessageEventPayload: CreateMessageEventPayload = {
      chat: 'a35fe77b-7d4f-4da2-8d5d-271cf9d82fee',
      message: 12 as any,
    };

    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
      data: createMessageEventPayload,
    };

    const socket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(socket);

    await authenticateWebSocket(socket, { token: CREATOR_SERVICE_TOKEN });

    await new Promise<void>((resolve) => {
      socket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<ChatException>;

        expect(chatEvent.event).toEqual(ChatEvent.ChatError);
        expect(chatEvent.data).toEqual('Bad Request Exception');

        resolve();
      };

      socket.send(JSON.stringify(createMessageEvent));
    });
  });

  it('`CREATE_MESSAGE` should fail if chat does not exist', async () => {
    const createMessageEventPayload: CreateMessageEventPayload = {
      chat: 'a35fe77b-7d4f-4da2-8d5d-271cf9d82fee',
      message: 'hello',
    };

    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
      data: createMessageEventPayload,
    };

    const creatorSocket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(creatorSocket);

    await authenticateWebSocket(creatorSocket, {
      token: CREATOR_SERVICE_TOKEN,
    });

    await new Promise<void>((resolve) => {
      creatorSocket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<ChatException>;

        expect(chatEvent.event).toEqual(ChatEvent.ChatError);
        expect(chatEvent.data).toEqual(ChatException.ChatNotFound);

        resolve();
      };

      creatorSocket.send(JSON.stringify(createMessageEvent));
    });
  });

  xit('`CREATE_MESSAGE` should succeed and only notify chat participants (including creator)', async () => {
    const createChatPayload: CreateChatPayload = {
      participants: ['f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba'],
    };

    const chat = (
      await request(server)
        .post('/chats')
        .set('Authorization', `Bearer ${CREATOR_SERVICE_TOKEN}`)
        .send(createChatPayload)
        .expect(201)
    ).body as PublicChat;

    await request(server)
      .get(`/chat/${chat.uuid}/messages`)
      .set('Authorization', `Bearer ${CREATOR_SERVICE_TOKEN}`)
      .expect(200)
      .expect([]);

    const createMessageEventPayload: CreateMessageEventPayload = {
      chat: chat.uuid,
      message: 'hello',
    };

    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
      data: createMessageEventPayload,
    };

    let message: PublicChatMessage;

    // Sockets
    const creatorSocket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(creatorSocket);
    await authenticateWebSocket(creatorSocket, {
      token: CREATOR_SERVICE_TOKEN,
    });

    const participantSocket = connectToWebsocket(server, SERVER_PORT, hostname);
    sockets.push(participantSocket);
    await authenticateWebSocket(participantSocket, {
      token: PARTICIPANT_SERVICE_TOKEN,
    });

    const nonParticipantSocket = connectToWebsocket(
      server,
      SERVER_PORT,
      hostname,
    );
    sockets.push(nonParticipantSocket);
    await authenticateWebSocket(nonParticipantSocket, {
      token: NON_PARTICIPANT_SERVICE_TOKEN,
    });

    // Does not notify non participant
    const nonParticipantEvents: any[] = [];

    nonParticipantSocket.onmessage = (event) => {
      const chatEvent = JSON.parse(event.data as any) as WsResponse<any>;

      nonParticipantEvents.push(chatEvent);
    };

    // Notifies other participant
    const participantNotification = new Promise<void>((resolve) => {
      participantSocket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<PublicChatMessage>;

        expect(chatEvent.event).toEqual(ChatEvent.MessageCreated);

        resolve();
      };
    });

    // Notifies creator
    const creatorNotification = new Promise<void>((resolve) => {
      creatorSocket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<PublicChatMessage>;

        const keys = Object.keys(chatEvent.data);
        const expectedKeys = ['uuid', 'chat', 'sender', 'date', 'body'];

        expect(keys.length).toEqual(expectedKeys.length);
        expect(equalSet(new Set(keys), new Set(expectedKeys))).toBeTruthy();

        expect(chatEvent.event).toEqual(ChatEvent.MessageCreated);
        expect(chatEvent.data.chat).toEqual(chat.uuid);
        expect(chatEvent.data.sender).toEqual(chatCreator.uuid);
        expect(isValidISODateString(chatEvent.data.date)).toBeTruthy();
        expect(chatEvent.data.body).toEqual(createMessageEventPayload.message);

        message = chatEvent.data;

        resolve();
      };

      creatorSocket.send(JSON.stringify(createMessageEvent));
    });

    await Promise.all([creatorNotification, participantNotification]);
    expect(nonParticipantEvents.length).toEqual(0);

    // Returns newly created message in list of messages for chat
    return request(server)
      .get(`/chat/${chat.uuid}/messages`)
      .set('Authorization', `Bearer ${CREATOR_SERVICE_TOKEN}`)
      .expect(200)
      .expect([message!]);
  });

  // @TODO: run suite in band
  xit('`CREATE_MESSAGE` should route message via broker', async () => {
    const firstServer = server;

    const secondServerPort = 3999;
    const {
      app: secondApp,
      server: secondServer,
    } = await setupChatWebsocketTest(3999, REDIS_CLIENT_ID_2, hostname);

    apps.push(secondApp);

    const createChatPayload: CreateChatPayload = {
      participants: ['f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba'],
    };

    const chat = (
      await request(firstServer)
        .post('/chats')
        .set('Authorization', `Bearer ${CREATOR_SERVICE_TOKEN}`)
        .send(createChatPayload)
        .expect(201)
    ).body as PublicChat;

    const createMessageEventPayload: CreateMessageEventPayload = {
      chat: chat.uuid,
      message: 'hello',
    };

    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
      data: createMessageEventPayload,
    };

    const creatorSocket = connectToWebsocket(
      firstServer,
      SERVER_PORT,
      hostname,
    );
    sockets.push(creatorSocket);
    await authenticateWebSocket(creatorSocket, {
      token: CREATOR_SERVICE_TOKEN,
    });

    const participantSocket = connectToWebsocket(
      secondServer,
      secondServerPort,
      hostname,
    );
    sockets.push(participantSocket);
    await authenticateWebSocket(participantSocket, {
      token: PARTICIPANT_SERVICE_TOKEN,
    });

    await new Promise<void>((resolve) => {
      let creatorMessageCount = 0;
      let participantMessageCount = 0;

      creatorSocket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<PublicChatMessage>;

        expect(chatEvent.event).toEqual(ChatEvent.MessageCreated);

        creatorMessageCount = creatorMessageCount + 1;
      };

      // Notifies participant connected to different server instance
      participantSocket.onmessage = (event) => {
        const chatEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<PublicChatMessage>;

        if (chatEvent.event !== ChatEvent.MessageCreated) {
          return;
        }

        const keys = Object.keys(chatEvent.data);
        const expectedKeys = ['uuid', 'chat', 'sender', 'date', 'body'];

        expect(keys.length).toEqual(expectedKeys.length);
        expect(equalSet(new Set(keys), new Set(expectedKeys))).toBeTruthy();

        expect(chatEvent.data.chat).toEqual(chat.uuid);
        expect(chatEvent.data.sender).toEqual(chatCreator.uuid);
        expect(isValidISODateString(chatEvent.data.date)).toBeTruthy();
        expect(chatEvent.data.body).toEqual(createMessageEventPayload.message);

        participantMessageCount = participantMessageCount + 1;
      };

      creatorSocket.send(JSON.stringify(createMessageEvent));

      setTimeout(() => {
        expect(creatorMessageCount).toEqual(1);
        expect(participantMessageCount).toEqual(1);

        resolve();
      }, 5000); // 5 seconds
    });
  }, 10000); // 10 seconds
});
