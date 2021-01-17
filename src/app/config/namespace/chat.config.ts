import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';

export interface ChatConfigProvider {
  database?: {
    host: string;
    port: number;
  };
}

export const ChatConfig = registerAs(
  ConfigNamespace.Chat,
  (): ChatConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const { CHAT_DATABASE_HOST, CHAT_DATABASE_PORT } = environment;

    const database: ChatConfigProvider['database'] =
      CHAT_DATABASE_HOST !== undefined && CHAT_DATABASE_PORT !== undefined
        ? {
            host: CHAT_DATABASE_HOST,
            port: CHAT_DATABASE_PORT,
          }
        : undefined;

    return {
      database,
    };
  },
);
