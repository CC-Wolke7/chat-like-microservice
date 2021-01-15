import { Environment } from './environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './namespace';

export interface CoreConfigProvider {
  gcp: {
    projectId: string;
  };
}

export const CoreConfig = registerAs(
  ConfigNamespace.Core,
  (): CoreConfigProvider => {
    const environment = (process.env as unknown) as Environment;

    return {
      gcp: {
        projectId: environment.GCP_PROJECT_ID,
      },
    };
  },
);
