import { Test, TestingModule } from '@nestjs/testing';
import { ProviderToken } from '../../../src/provider';
import { ChatStorageMock } from '../../../src/chat/__mocks__/chat.storage';
import { AppEvent } from '../../../src/app/event';
import { RootModule } from '../../../src/root.module';
import { WsResponse } from '@nestjs/websockets';
import { HealthStatus } from '../../../src/app/interfaces/health';
import {
  connectToWebsocket,
  setupWebsocketTest,
  stopWebsocketTest,
  WebsocketTestEnvironment,
} from '../../util/helper';
import * as WebSocket from 'ws';

describe('AppGateway (e2e)', () => {
  // MARK: - Properties
  let environment: WebsocketTestEnvironment;

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RootModule],
    })
      .overrideProvider(ProviderToken.CHAT_STORAGE)
      .useClass(ChatStorageMock)
      .compile();

    environment = await setupWebsocketTest(moduleFixture, 3001);
  });

  afterEach(async () => {
    await stopWebsocketTest(environment.app);
  });

  // MARK: - Tests
  it(`should emit \`${AppEvent.HealthStatus}\` event with payload \`${HealthStatus.Normal}\` on '${AppEvent.HealthRequest}' event`, (done) => {
    const { server } = environment;
    const socket = connectToWebsocket(server);

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
