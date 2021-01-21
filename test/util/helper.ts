import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import * as WebSocket from 'ws';
import { RootModule } from '../../src/root.module';
import {
  ServiceAccountConfig,
  ServiceAccountConfigProvider,
} from '../../src/app/config/namespace/service-account.config';
import { ServiceAccountName } from '../../src/app/auth/interfaces/service-account';
import { Plugin } from '../../src/plugins';
import { ChatStorageProviderType } from '../../src/chat/chat.storage';
import { ChatConfig } from '../../src/app/config/namespace/chat.config';

// Service Accounts Config
export const GENERIC_SERVICE_ACCOUNT_TOKEN =
  'NzYxMjg5NDEwNmNkNGYyN2M2MGRlNDM1N2VmMjJkZDEK';
export const GENERIC_SERVICE_ACCOUNT_USER_TOKEN =
  'NDc2MmViYjU5YjcwODkyMzAxZjBlMTJjYzcxY2NlMWIK';
export const RECOMMENDER_BOT_TOKEN =
  'ZjYxMjczN2ZlZTkxMDhiZWM5ZjgxYWQwNTI3N2VlOGMK';

export const CREATOR_SERVICE_TOKEN =
  'MWZhMzExZDhkOGM1ZWI0ODBmYmQ5YWQyYTdkMzNmNmUK';
export const PARTICIPANT_SERVICE_TOKEN =
  'NGU5ZmRiNThkZWM3Y2Y2OGRjYzk0NTYwNjU2NTRlOGYK';
export const NON_PARTICIPANT_SERVICE_TOKEN =
  'M2EzNzE0M2JkNzFhZTc3M2FhODIwMjc4NDU3MTgzMjgK';

export const TEST_SERVICE_ACCOUNT_CONFIG: ServiceAccountConfigProvider = {
  tokenWhitelist: [
    GENERIC_SERVICE_ACCOUNT_TOKEN,
    GENERIC_SERVICE_ACCOUNT_USER_TOKEN,
    RECOMMENDER_BOT_TOKEN,
    CREATOR_SERVICE_TOKEN,
    PARTICIPANT_SERVICE_TOKEN,
    NON_PARTICIPANT_SERVICE_TOKEN,
  ],
  accountForToken: {
    [GENERIC_SERVICE_ACCOUNT_TOKEN]: {
      name: ServiceAccountName.UnitTest,
    },
    [GENERIC_SERVICE_ACCOUNT_USER_TOKEN]: {
      name: ServiceAccountName.UnitTest,
      uuid: 'f66d0a46-49c4-43dd-a122-8d32d87b3eed',
    },
    [RECOMMENDER_BOT_TOKEN]: {
      name: ServiceAccountName.RecommenderBot,
      uuid: '51180bfc-b749-470b-8205-63d4392ff7d5',
    },
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

// Chat Config
export const REDIS_CLIENT_ID_1 = '824e4a6e-589f-4760-97a9-8bb38b1de80f';
export const REDIS_CLIENT_ID_2 = 'b90ac58c-2945-4e5d-9cdd-b18d84946280';

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
  apps: INestApplication[],
  sockets: WebSocket[],
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

  for (const app of apps) {
    await app.close();
  }
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
  redisClientId: string,
): Promise<WebsocketTestEnvironment> {
  const chatConfig = ChatConfig();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      RootModule.register({
        plugins: new Set([Plugin.ChatApi]),
        optionsForPlugin: {
          [Plugin.ChatApi]: {
            storage: ChatStorageProviderType.InMemory,
          },
        },
      }),
    ],
  })
    .overrideProvider(ServiceAccountConfig.KEY)
    .useValue(TEST_SERVICE_ACCOUNT_CONFIG)
    .overrideProvider(ChatConfig.KEY)
    .useValue({
      ...chatConfig,
      redis: {
        ...chatConfig.redis,
        clientId: redisClientId,
      },
    })
    .compile();

  const { app, server } = await setupWebsocketTest(moduleFixture, port);

  return { app, server };
}
