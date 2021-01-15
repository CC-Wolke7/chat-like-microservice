import { Environment } from './environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './namespace';

export interface ChatConfigProvider {
  database: {
    host?: string;
    port?: number;
  };
}

export const ChatConfig = registerAs(
  ConfigNamespace.Chat,
  (): ChatConfigProvider => {
    const environment = (process.env as unknown) as Environment;

    return {
      database: {
        host: environment.CHAT_DATABASE_HOST,
        port: environment.CHAT_DATABASE_PORT,
      },
    };
  },
);
