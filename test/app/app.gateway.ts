import { Test, TestingModule } from '@nestjs/testing';
import { ProviderToken } from '../../src/provider';
import { InMemoryChatStorage } from '../../src/chat/storage/memory/memory-chat.storage';
import { AppEvent } from '../../src/app/gateway/app.gateway.event';
import { RootModule } from '../../src/root.module';
import { WsResponse } from '@nestjs/websockets';
import { HealthStatus } from '../../src/app/interfaces/health';
import {
  connectToWebsocket,
  setupWebsocketTest,
  stopWebsocketTest,
  WebsocketTestEnvironment,
} from '../util/helper';
import * as WebSocket from 'ws';
import { CoreConfig } from '../../src/app/config/namespace/core.config';

describe('AppGateway (e2e)', () => {
  // MARK: - Properties
  const SERVER_PORT = 3001;
  let environment: WebsocketTestEnvironment;
  let sockets: WebSocket[];

  const {
    server: { hostname },
  } = CoreConfig();

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RootModule.register({ plugins: new Set([]), optionsForPlugin: {} }),
      ],
    })
      .overrideProvider(ProviderToken.CHAT_STORAGE)
      .useClass(InMemoryChatStorage)
      .compile();

    environment = await setupWebsocketTest(
      moduleFixture,
      SERVER_PORT,
      hostname,
    );
  });

  afterEach(async () => {
    await stopWebsocketTest([environment.app], sockets);
  });

  // MARK: - Tests
  it(`should emit \`${AppEvent.HealthStatus}\` event with payload \`${HealthStatus.Normal}\` on '${AppEvent.HealthRequest}' event`, (done) => {
    const { server } = environment;
    const socket = connectToWebsocket(server, SERVER_PORT, hostname);

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
