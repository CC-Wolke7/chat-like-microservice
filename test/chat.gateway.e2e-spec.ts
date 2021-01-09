import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProviderToken } from '../src/provider';
import { ChatStorageMock } from '../src/chat/__mocks__/chat.storage';
import { ServiceTokenGuard } from '../src/auth/service-token/service-token.guard';
import { AuthGuardMock } from '../src/auth/__mocks__/auth.guard';
import {
  ServiceAccountName,
  ServiceAccountUser,
} from '../src/auth/interfaces/service-account';
import { UserType } from '../src/auth/interfaces/user';
import * as WebSocket from 'ws';
import { WsAdapter } from '@nestjs/platform-ws';
import { RootModule } from '../src/root.module';
// import { ChatEvent } from '../src/chat/event';
// import { HealthStatus } from '../src/app/interfaces/health';
// import { WsResponse } from '@nestjs/websockets';

describe('ChatGateway (e2e)', () => {
  // MARK: - Properties
  let app: INestApplication;
  let server: any;
  let socket: WebSocket;

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RootModule],
    })
      .overrideProvider(ProviderToken.CHAT_STORAGE)
      .useClass(ChatStorageMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));

    server = await app.listen(3000);

    const { address, port } = server.address();
    const host = `[${address}]:${port}`;

    socket = new WebSocket(`ws://${host}`);
  });

  afterEach(async () => {
    socket.close();
    await app.close();
  });

  // MARK: - Tests
  // @TODO: implement
  it('should fail to connect if not authenticated', (done) => {
    socket.on('open', () => {
      done();
    });
  });
});

describe('ChatGateway (e2e) [authenticated]', () => {
  // MARK: - Properties
  let app: INestApplication;
  let server: any;
  let socket: WebSocket;

  const user: ServiceAccountUser = {
    type: UserType.ServiceAccount,
    name: ServiceAccountName.UnitTest,
    uuid: '5a994e8e-7dbe-4a61-9a21-b0f45d1bffbd',
  };

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RootModule],
    })
      .overrideProvider(ProviderToken.CHAT_STORAGE)
      .useClass(ChatStorageMock)
      .overrideGuard(ServiceTokenGuard)
      .useValue(new AuthGuardMock(user))
      .compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));

    server = await app.listen(3000);

    const { address, port } = server.address();
    const host = `[${address}]:${port}`;

    socket = new WebSocket(`ws://${host}`);
  });

  afterEach(async () => {
    socket.close();
    await app.close();
  });

  // MARK: - Tests
  it('should connect', (done) => {
    socket.on('open', () => {
      done();
    });
  });

  // it('should return "OK" on health message', (done) => {
  //   socket.onopen = () => {
  //     socket.onmessage = (event: WebSocket.MessageEvent) => {
  //       const appEvent = JSON.parse(
  //         event.data as any,
  //       ) as WsResponse<HealthStatus>;

  //       expect(appEvent.event).toEqual(ChatEvent.MessageCreated);
  //       expect(appEvent.data).toEqual(HealthStatus.Normal);

  //       done();
  //     };

  //     socket.send(
  //       JSON.stringify({
  //         event: ChatEvent.CreateMessageRequest,
  //       }),
  //     );
  //   };
  // });
});
