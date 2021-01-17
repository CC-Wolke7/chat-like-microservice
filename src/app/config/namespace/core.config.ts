import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';
import { ALL_PLUGINS, Plugin } from '../../../plugins';

export interface CoreConfigProvider {
  plugins: Set<Plugin>;
  gcp: {
    projectId: string;
  };
}

export const CoreConfig = registerAs(
  ConfigNamespace.Core,
  (): CoreConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const { PLUGINS, GCP_PROJECT_ID } = environment;

    return {
      plugins: PLUGINS ? new Set(PLUGINS.split(',') as Plugin[]) : ALL_PLUGINS,
      gcp: {
        projectId: GCP_PROJECT_ID,
      },
    };
  },
);
