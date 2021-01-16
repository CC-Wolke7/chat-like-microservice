import { registerAs } from '@nestjs/config';
import { Environment } from './environment';
import { ConfigNamespace } from './namespace';

export interface LikeConfigProvider {
  database?: {
    host: string;
    port: number;
  };
  bigtable: {
    instanceId: string;
  };
}

export const LikeConfig = registerAs(
  ConfigNamespace.Like,
  (): LikeConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const { LIKE_DATABASE_HOST, LIKE_DATABASE_PORT } = environment;

    const database: LikeConfigProvider['database'] =
      LIKE_DATABASE_HOST !== undefined && LIKE_DATABASE_PORT !== undefined
        ? {
            host: LIKE_DATABASE_HOST,
            port: LIKE_DATABASE_PORT,
          }
        : undefined;

    return {
      database,
      bigtable: {
        instanceId: environment.LIKE_BIGTABLE_INSTANCE_ID,
      },
    };
  },
);
