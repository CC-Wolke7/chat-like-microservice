import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';
import { ChatStorageProviderType } from '../../../chat/chat.module';

export interface ChatConfigProvider {
  storage?: ChatStorageProviderType;
  firestore?: {
    host: string;
    port: number;
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
    } = environment;

    return {
      storage: CHAT_STORAGE,
      firestore:
        CHAT_FIRESTORE_HOST && CHAT_FIRESTORE_PORT
          ? {
              host: CHAT_FIRESTORE_HOST,
              port: CHAT_FIRESTORE_PORT,
            }
          : undefined,
    };
  },
);
