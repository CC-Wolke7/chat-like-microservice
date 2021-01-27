import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';
import { ALL_PLUGINS, Plugin } from '../../../plugins';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { toArray, toSet } from '../../../util/helper';

export interface CoreConfigProvider {
  plugins: Set<Plugin>;
  gcp: {
    projectId?: string;
  };
  cors: Pick<CorsOptions, 'origin' | 'credentials'>;
}

export const CoreConfig = registerAs(
  ConfigNamespace.Core,
  (): CoreConfigProvider => {
    const environment = (process.env as unknown) as Environment;

    const {
      PLUGINS,
      GCP_PROJECT_ID,
      CORS_ORIGIN_WHITELIST,
      CORS_ALLOW_CREDENTIALS,
    } = environment;

    return {
      plugins: PLUGINS ? toSet(PLUGINS) : ALL_PLUGINS,
      gcp: {
        projectId: GCP_PROJECT_ID,
      },
      cors: {
        origin: CORS_ORIGIN_WHITELIST ? toArray(CORS_ORIGIN_WHITELIST) : [],
        credentials: CORS_ALLOW_CREDENTIALS
          ? Boolean(CORS_ALLOW_CREDENTIALS)
          : true,
      },
    };
  },
);
