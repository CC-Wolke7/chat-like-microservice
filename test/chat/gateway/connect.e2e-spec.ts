import {
  setupChatWebsocketTest,
  stopWebsocketTest,
  WebsocketTestEnvironment,
  connectToWebsocket,
  CREATOR_SERVICE_TOKEN,
} from '../../util/helper';
import * as WebSocket from 'ws';

describe('ChatGateway (e2e) [authenticated]', () => {
  // MARK: - Properties
  let environment: WebsocketTestEnvironment;
  let sockets: WebSocket[];

  // MARK: - Hooks
  beforeEach(async () => {
    environment = await setupChatWebsocketTest(4000);
    sockets = [];
  });

  afterEach(async () => {
    await stopWebsocketTest(environment.app, ...sockets);
  });

  // MARK: - Tests
  // @TODO: fix to allow multiple websocket tests in a suite
  it('should connect', (done) => {
    const { server } = environment;

    const socket = connectToWebsocket(server, {
      headers: {
        Authorization: `Bearer ${CREATOR_SERVICE_TOKEN}`,
      },
    });

    sockets.push(socket);

    socket.on('open', () => {
      done();
    });
  });
});
