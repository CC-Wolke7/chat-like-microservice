import {
  ServiceAccountName,
  ServiceAccountUser,
} from '../../../src/app/auth/interfaces/service-account';
import { UserType } from '../../../src/app/auth/interfaces/user';
import { ChatEvent } from '../../../src/chat/gateway/event';
import { WsResponse } from '@nestjs/websockets';
import { CreateChatPayload } from '../../../src/chat/interfaces/dto';
import * as request from 'supertest';
import { PublicChat, PublicChatMessage } from '../interfaces/chat';
import { CreateMessageEventPayload } from '../../../src/chat/gateway/interfaces/dto.gateway';
import { isValidISODateString } from 'iso-datestring-validator';
import { equalSet } from '../../../src/util/helper';
import {
  ChatWebsocketTestEnvironment,
  getTestSocket,
  setupChatWebsocketTest,
  stopWebsocketTest,
} from '../../util/helper';

describe('ChatGateway (e2e) [authenticated]', () => {
  // MARK: - Properties
  let environment: ChatWebsocketTestEnvironment;

  const user: ServiceAccountUser = {
    type: UserType.ServiceAccount,
    name: ServiceAccountName.UnitTest,
    uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
  };

  // MARK: - Hooks
  beforeEach(async () => {
    environment = await setupChatWebsocketTest(user, 3001);
  });

  afterEach(async () => {
    await stopWebsocketTest(environment.app, environment.socket);
  });

  // MARK: - Tests
  it('should create message and notify chat participants (including sender)', async () => {
    const { server, socket } = environment;

    const createChatPayload: CreateChatPayload = {
      participants: [
        'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
        '5235ab4e-4fd7-449b-aea2-55b5fc792e5b',
      ],
    };

    const chat = (
      await request(server).post('/chats').send(createChatPayload).expect(201)
    ).body as PublicChat;

    // @TODO: fix to allow request before websocket
    // await request(server)
    //   .get(`/chat/${chat.uuid}/messages`)
    //   .expect(200)
    //   .expect([]);

    const createMessageEventPayload: CreateMessageEventPayload = {
      chat: chat.uuid,
      message: 'hello',
    };

    const createMessageEvent: WsResponse<CreateMessageEventPayload> = {
      event: ChatEvent.CreateMessage,
      data: createMessageEventPayload,
    };

    // Notifies sender
    let message: PublicChatMessage;

    const senderNotification = new Promise<void>((resolve) => {
      socket.onopen = () => {
        console.log('Sender connected');

        socket.onmessage = (event) => {
          const chatEvent = JSON.parse(
            event.data as any,
          ) as WsResponse<PublicChatMessage>;

          console.log('Sender notification');

          const keys = Object.keys(chatEvent.data);
          const expectedKeys = ['uuid', 'chat', 'sender', 'date', 'body'];

          expect(keys.length).toEqual(expectedKeys.length);
          expect(equalSet(new Set(keys), new Set(expectedKeys))).toBeTruthy();

          expect(chatEvent.event).toEqual(ChatEvent.MessageCreated);
          expect(chatEvent.data.chat).toEqual(chat.uuid);
          expect(chatEvent.data.sender).toEqual(user.uuid);
          expect(isValidISODateString(chatEvent.data.date)).toBeTruthy();
          expect(chatEvent.data.body).toEqual(
            createMessageEventPayload.message,
          );

          message = chatEvent.data;

          resolve();
        };

        socket.send(JSON.stringify(createMessageEvent));
      };
    });

    // Notifies other participant
    // const participantSocket = getTestSocket(server);

    // const participantNotification = new Promise<void>((resolve) => {
    //   participantSocket.onopen = () => {
    //     console.log('Participant connected');

    //     socket.onmessage = (event) => {
    //       const chatEvent = JSON.parse(
    //         event.data as any,
    //       ) as WsResponse<PublicChatMessage>;

    //       console.log('Participant notification');

    //       expect(chatEvent.event).toEqual(ChatEvent.MessageCreated);

    //       resolve();
    //     };
    //   };
    // });

    await Promise.all([senderNotification]);

    // Returns newly created message in list of messages for chat
    return request(server)
      .get(`/chat/${chat.uuid}/messages`)
      .expect(200)
      .expect([message!]);
  });
});
