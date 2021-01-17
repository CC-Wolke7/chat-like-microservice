import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as WebSocket from 'ws';
import { WsAdapter } from '@nestjs/platform-ws';
import { InMemoryChatStorage } from '../../../src/chat/storage/memory/memory-chat.storage';
import { ProviderToken } from '../../../src/provider';
import { RootModule } from '../../../src/root.module';
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
      imports: [RootModule.register({ plugins: new Set([]) })],
    })
      .overrideProvider(ProviderToken.CHAT_STORAGE)
      .useClass(InMemoryChatStorage)
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
});
