import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';
import { ChatStorageProviderType } from '../../../chat/chat.storage';

export interface ChatConfigProvider {
  storage: ChatStorageProviderType;
  firestore: {
    host?: string;
    port?: number;
  };
  redis: {
    clientId?: string;
    host?: string;
    port?: number;
  };
}

export const ChatConfig = registerAs(
  ConfigNamespace.Chat,
  (): ChatConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const {
      CHAT_STORAGE,
      CHAT_FIRESTORE_HOST,
      CHAT_FIRESTORE_PORT,
      CHAT_REDIS_CLIENT_ID,
      CHAT_REDIS_HOST,
      CHAT_REDIS_PORT,
    } = environment;

    return {
      storage: CHAT_STORAGE ?? ChatStorageProviderType.InMemory,
      firestore: {
        host: CHAT_FIRESTORE_HOST,
        port: CHAT_FIRESTORE_PORT,
      },
      redis: {
        clientId: CHAT_REDIS_CLIENT_ID,
        host: CHAT_REDIS_HOST,
        port: CHAT_REDIS_PORT,
      },
    };
  },
);
