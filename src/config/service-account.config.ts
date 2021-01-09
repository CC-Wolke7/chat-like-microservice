import {
  ServiceAccount,
  ServiceAccountName,
} from '../auth/interfaces/service-account';
import { Environment } from './environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './namespace';

export interface ServiceAccountConfig {
  tokenWhitelist: string[];
  accountForToken: {
    [token: string]: Omit<ServiceAccount, 'type'>;
  };
}

export default registerAs(
  ConfigNamespace.ServiceAccount,
  (): ServiceAccountConfig => {
    const environment = (process.env as unknown) as Environment;

    return {
      tokenWhitelist: [environment.RECOMMENDER_BOT_TOKEN],
      accountForToken: {
        [environment.RECOMMENDER_BOT_TOKEN]: {
          name: ServiceAccountName.RecommenderBot,
          uuid: environment.RECOMMENDER_BOT_USER_UUID,
        },
      },
    };
  },
);
