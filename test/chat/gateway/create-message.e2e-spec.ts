import { ChatEvent } from '../../../src/chat/gateway/event';
import { WsResponse } from '@nestjs/websockets';
import { CreateChatPayload } from '../../../src/chat/interfaces/dto';
import * as request from 'supertest';
import { PublicChat, PublicChatMessage } from '../interfaces/chat';
import { CreateMessageEventPayload } from '../../../src/chat/gateway/interfaces/dto.gateway';
import { isValidISODateString } from 'iso-datestring-validator';
import { equalSet } from '../../../src/util/helper';
import {
  connectToWebsocket,
  CREATOR_SERVICE_TOKEN,
  NON_PARTICIPANT_SERVICE_TOKEN,
  PARTICIPANT_SERVICE_TOKEN,
  setupChatWebsocketTest,
  stopWebsocketTest,
  TEST_SERVICE_ACCOUNT_CONFIG,
  WebsocketTestEnvironment,
} from '../../util/helper';
import * as WebSocket from 'ws';

describe('ChatGateway (e2e) [authenticated]', () => {
  // MARK: - Properties
  let environment: WebsocketTestEnvironment;
  let sockets: WebSocket[];

  const chatCreator =
    TEST_SERVICE_ACCOUNT_CONFIG.accountForToken[CREATOR_SERVICE_TOKEN];

  // MARK: - Hooks
  beforeEach(async () => {
    environment = await setupChatWebsocketTest(4001);
    sockets = [];
  });

  afterEach(async () => {
    await stopWebsocketTest(environment.app, ...sockets);
  });

  // MARK: - Tests
  it('should create message and only notify chat participants (including creator)', async () => {
    const { server } = environment;

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

    // Notifies creator
    const creatorSocket = connectToWebsocket(server, {
      headers: {
        Authorization: `Bearer ${CREATOR_SERVICE_TOKEN}`,
      },
    });

    sockets.push(creatorSocket);

    const creatorNotification = new Promise<void>((resolve) => {
      creatorSocket.onopen = () => {
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
          expect(chatEvent.data.body).toEqual(
            createMessageEventPayload.message,
          );

          message = chatEvent.data;

          resolve();
        };

        creatorSocket.send(JSON.stringify(createMessageEvent));
      };
    });

    // Notifies other participant
    const participantSocket = connectToWebsocket(server, {
      headers: {
        Authorization: `Bearer ${PARTICIPANT_SERVICE_TOKEN}`,
      },
    });

    sockets.push(participantSocket);

    const participantNotification = new Promise<void>((resolve) => {
      participantSocket.onopen = () => {
        participantSocket.onmessage = (event) => {
          const chatEvent = JSON.parse(
            event.data as any,
          ) as WsResponse<PublicChatMessage>;

          expect(chatEvent.event).toEqual(ChatEvent.MessageCreated);

          resolve();
        };
      };
    });

    // Does not notify non participant
    const nonParticipantSocket = connectToWebsocket(server, {
      headers: {
        Authorization: `Bearer ${NON_PARTICIPANT_SERVICE_TOKEN}`,
      },
    });

    sockets.push(nonParticipantSocket);

    const nonParticipantEmptyNotification = new Promise<void>(
      (resolve, reject) => {
        nonParticipantSocket.onopen = () => {
          resolve();

          nonParticipantSocket.onmessage = (event) => {
            reject();
          };
        };
      },
    );

    await Promise.all([creatorNotification, participantNotification]);
    await nonParticipantEmptyNotification;

    // Returns newly created message in list of messages for chat
    return request(server)
      .get(`/chat/${chat.uuid}/messages`)
      .set('Authorization', `Bearer ${CREATOR_SERVICE_TOKEN}`)
      .expect(200)
      .expect([message!]);
  });
});
