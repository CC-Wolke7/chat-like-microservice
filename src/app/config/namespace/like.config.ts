import { registerAs } from '@nestjs/config';
import { LikeStorageProviderType } from '../../../like/like.storage';
import { Environment } from '../environment';
import { ConfigNamespace } from '../namespace';

export interface LikeConfigProvider {
  storage: LikeStorageProviderType;
  bigtable: {
    instanceId?: string;
    host?: string;
    port?: number;
  };
}

export const LikeConfig = registerAs(
  ConfigNamespace.Like,
  (): LikeConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const {
      LIKE_STORAGE,
      LIKE_BIGTABLE_INSTANCE_ID,
      LIKE_BIGTABLE_HOST,
      LIKE_BIGTABLE_PORT,
    } = environment;

    return {
      storage: LIKE_STORAGE ?? LikeStorageProviderType.InMemory,
      bigtable: {
        instanceId: LIKE_BIGTABLE_INSTANCE_ID,
        host: LIKE_BIGTABLE_HOST,
        port: LIKE_BIGTABLE_PORT,
      },
    };
  },
);
