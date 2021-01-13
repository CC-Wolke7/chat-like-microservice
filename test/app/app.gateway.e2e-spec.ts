import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProviderToken } from '../../src/provider';
import { ChatStorageMock } from '../../src/chat/__mocks__/chat.storage';
import * as WebSocket from 'ws';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppEvent } from '../../src/app/event';
import { RootModule } from '../../src/root.module';
import { WsResponse } from '@nestjs/websockets';
import { HealthStatus } from '../../src/app/interfaces/health';
// import { io, Socket } from 'socket.io-client';
// import { IoAdapter } from '@nestjs/platform-socket.io';

// @TODO: fix test setup to support socket.io
// https://github.com/nestjs/docs.nestjs.com/issues/97
// https://github.com/nestjs/nest/issues/1368
describe('AppGateway (e2e)', () => {
  // MARK: - Properties
  let app: INestApplication;
  let server: any;
  let socket: WebSocket;
  // let socket: Socket;

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
    // app.useWebSocketAdapter(new IoAdapter(app));

    // await app.init();
    server = await app.listen(3000); // app.getHttpServer().listen()

    const { address, port } = server.address();
    const host = `[${address}]:${port}`;

    socket = new WebSocket(`ws://${host}`); // also http://

    // socket = io(`http://${host}`, {
    //   forceNew: true,
    // });
  });

  afterEach(async () => {
    socket.close();
    await app.close();
  });

  // MARK: - Tests
  it('should be able to connect', (done) => {
    socket.on('open', () => {
      done();
    });
  });

  // it('/socket.io', (done) => {
  //   socket.on('connect', () => {
  //     console.log('connnected to websocket');
  //     done();
  //   });

  //   socket.on('open', () => {
  //     console.log('I am connected! YEAAAP');
  //     done();
  //   });

  //   socket.connect();
  // });

  it(`should emit \`${AppEvent.HealthStatus}\` event with payload \`${HealthStatus.Normal}\` on '${AppEvent.HealthRequest}' event`, (done) => {
    socket.onopen = () => {
      socket.onmessage = (event: WebSocket.MessageEvent) => {
        const appEvent = JSON.parse(
          event.data as any,
        ) as WsResponse<HealthStatus>;

        expect(appEvent.event).toEqual(AppEvent.HealthStatus);
        expect(appEvent.data).toEqual(HealthStatus.Normal);

        done();
      };

      socket.send(
        JSON.stringify({
          event: AppEvent.HealthRequest,
        }),
      );
    };
  });
});
