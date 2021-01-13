import {
  ServiceAccountName,
  ServiceAccountUser,
} from '../../../src/app/auth/interfaces/service-account';
import { UserType } from '../../../src/app/auth/interfaces/user';
import {
  ChatWebsocketTestEnvironment,
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
  // @TODO: fix to allow multiple websocket tests in a suite
  it('should connect', (done) => {
    const { socket } = environment;

    socket.on('open', () => {
      done();
    });
  });
});
