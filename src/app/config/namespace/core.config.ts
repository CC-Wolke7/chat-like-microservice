import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';
import { ALL_PLUGINS, Plugin } from '../../../plugins';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { toArray, toBoolean, toSet } from '../../../util/helper';

export interface CoreConfigProvider {
  plugins: Set<Plugin>;
  vetShelter: {
    apiUrl: string;
  };
  gcp: {
    projectId?: string;
  };
  cors: Pick<CorsOptions, 'origin' | 'credentials'>;
  server: {
    port?: number;
    hostname?: string;
  };
}

export const CoreConfig = registerAs(
  ConfigNamespace.Core,
  (): CoreConfigProvider => {
    const environment = (process.env as unknown) as Environment;

    const {
      PLUGINS,
      VET_SHELTER_API_URL,
      GCP_PROJECT_ID,
      CORS_ORIGIN_WHITELIST,
      CORS_ALLOW_CREDENTIALS,
      SERVER_HOSTNAME,
      SERVER_PORT,
    } = environment;

    return {
      plugins: PLUGINS ? toSet(PLUGINS) : ALL_PLUGINS,
      vetShelter: {
        apiUrl: VET_SHELTER_API_URL,
      },
      gcp: {
        projectId: GCP_PROJECT_ID,
      },
      cors: {
        origin: CORS_ORIGIN_WHITELIST ? toArray(CORS_ORIGIN_WHITELIST) : [],
        credentials: CORS_ALLOW_CREDENTIALS
          ? toBoolean(CORS_ALLOW_CREDENTIALS)
          : true,
      },
      server: {
        port: SERVER_PORT,
        hostname: SERVER_HOSTNAME,
      },
    };
  },
);
