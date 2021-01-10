import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import * as WebSocket from 'ws';
import { UserEntity } from '../../src/app/auth/interfaces/user';
import { ServiceTokenGuard } from '../../src/app/auth/strategy/service-token/service-token.guard';
import { AuthGuardMock } from '../../src/app/auth/__mocks__/auth.guard';
import { ChatStorageMock } from '../../src/chat/__mocks__/chat.storage';
import { ProviderToken } from '../../src/provider';
import { RootModule } from '../../src/root.module';

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

export function getTestSocket(server: any): WebSocket {
  const { address, port } = server.address();
  const host = `[${address}]:${port}`;

  return new WebSocket(`ws://${host}`);
}

export async function stopWebsocketTest(
  app: INestApplication,
  ...sockets: WebSocket[]
): Promise<void> {
  try {
    for (const socket of sockets) {
      socket.close();
    }
  } catch {
    //
  }

  await app.close();
}

// Chat
export type ChatWebsocketTestEnvironment = WebsocketTestEnvironment & {
  socket: WebSocket;
};

export async function setupChatWebsocketTest(
  user: UserEntity | undefined,
  port: number,
): Promise<ChatWebsocketTestEnvironment> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [RootModule],
  })
    .overrideProvider(ProviderToken.CHAT_STORAGE)
    .useClass(ChatStorageMock)
    .overrideGuard(ServiceTokenGuard)
    .useValue(new AuthGuardMock(user))
    .compile();

  const { app, server } = await setupWebsocketTest(moduleFixture, port);

  return { app, server, socket: getTestSocket(server) };
}
