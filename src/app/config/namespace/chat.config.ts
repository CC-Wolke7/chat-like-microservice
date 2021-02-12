import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';
import { ChatStorageProviderType } from '../../../chat/chat.storage';
import { toBoolean } from '../../../util/helper';

export interface ChatConfigProvider {
  storage: ChatStorageProviderType;
  brokerMode: boolean;
  firestore: {
    host?: string;
    port?: number;
  };
  redis: {
    clientId?: string;
    host?: string;
    port?: number;
    auth?: string;
  };
}

export const ChatConfig = registerAs(
  ConfigNamespace.Chat,
  (): ChatConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const {
      CHAT_STORAGE,
      CHAT_BROKER_ENABLED,
      CHAT_FIRESTORE_HOST,
      CHAT_FIRESTORE_PORT,
      CHAT_REDIS_CLIENT_ID,
      CHAT_REDIS_HOST,
      CHAT_REDIS_PORT,
      CHAT_REDIS_AUTH,
    } = environment;

    return {
      storage: CHAT_STORAGE ?? ChatStorageProviderType.InMemory,
      brokerMode: CHAT_BROKER_ENABLED ? toBoolean(CHAT_BROKER_ENABLED) : false,
      firestore: {
        host: CHAT_FIRESTORE_HOST,
        port: CHAT_FIRESTORE_PORT,
      },
      redis: {
        clientId: CHAT_REDIS_CLIENT_ID,
        host: CHAT_REDIS_HOST,
        port: CHAT_REDIS_PORT,
        auth: CHAT_REDIS_AUTH,
      },
    };
  },
);
