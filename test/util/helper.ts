import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import * as WebSocket from 'ws';
import { InMemoryChatStorage } from '../../src/chat/storage/memory/memory-chat.storage';
import { ProviderToken } from '../../src/provider';
import { RootModule } from '../../src/root.module';
import {
  ServiceAccountConfig,
  ServiceAccountConfigProvider,
} from '../../src/app/config/namespace/service-account.config';
import { ServiceAccountName } from '../../src/app/auth/interfaces/service-account';
import { Plugin } from '../../src/plugins';

// Service Accouns
export const CREATOR_SERVICE_TOKEN =
  'MWZhMzExZDhkOGM1ZWI0ODBmYmQ5YWQyYTdkMzNmNmUK';
export const PARTICIPANT_SERVICE_TOKEN =
  'NGU5ZmRiNThkZWM3Y2Y2OGRjYzk0NTYwNjU2NTRlOGYK';
export const NON_PARTICIPANT_SERVICE_TOKEN =
  'M2EzNzE0M2JkNzFhZTc3M2FhODIwMjc4NDU3MTgzMjgK';

export const TEST_SERVICE_ACCOUNT_CONFIG: ServiceAccountConfigProvider = {
  tokenWhitelist: [
    CREATOR_SERVICE_TOKEN,
    PARTICIPANT_SERVICE_TOKEN,
    NON_PARTICIPANT_SERVICE_TOKEN,
  ],
  accountForToken: {
    [CREATOR_SERVICE_TOKEN]: {
      name: ServiceAccountName.UnitTest,
      uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
    },
    [PARTICIPANT_SERVICE_TOKEN]: {
      name: ServiceAccountName.UnitTest,
      uuid: 'f384a3d9-cc6d-4a5d-b476-50a69a3bf7ba',
    },
    [NON_PARTICIPANT_SERVICE_TOKEN]: {
      name: ServiceAccountName.UnitTest,
      uuid: 'f733beac-4857-445b-b967-31583e3d2e1f',
    },
  },
};

// Setup
export interface WebsocketTestEnvironment {
  app: INestApplication;
  server: any;
}

export async function setupWebsocketTest(
  fixture: TestingModule,
  port: number,
): Promise<WebsocketTestEnvironment> {
  const app = fixture.createNestApplication();
  app.useWebSocketAdapter(new WsAdapter(app));

  const server = await app.listen(port);

  return {
    app,
    server,
  };
}

export async function stopWebsocketTest(
  app: INestApplication,
  ...sockets: WebSocket[]
): Promise<void> {
  try {
    for (const socket of sockets) {
      if (socket.readyState !== WebSocket.CONNECTING) {
        socket.close();
      }
    }
  } catch {
    //
  }

  await app.close();
}

export function connectToWebsocket(
  server: any,
  options?: WebSocket.ClientOptions,
): WebSocket {
  const { address, port } = server.address();
  const host = `[${address}]:${port}`;

  return new WebSocket(`ws://${host}`, options);
}

// Chat Websocket Test
export async function setupChatWebsocketTest(
  port: number,
): Promise<WebsocketTestEnvironment> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [RootModule.register({ plugins: new Set([Plugin.ChatApi]) })],
  })
    .overrideProvider(ProviderToken.CHAT_STORAGE)
    .useClass(InMemoryChatStorage)
    .overrideProvider(ServiceAccountConfig.KEY)
    .useValue(TEST_SERVICE_ACCOUNT_CONFIG)
    .compile();

  const { app, server } = await setupWebsocketTest(moduleFixture, port);

  return { app, server };
}
