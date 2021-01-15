import {
  ServiceAccount,
  ServiceAccountName,
} from '../auth/interfaces/service-account';
import { Environment } from './environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from './namespace';

type Token = string;

export interface ServiceAccountConfigProvider {
  tokenWhitelist: string[];
  accountForToken: Record<Token, Omit<ServiceAccount, 'type'>>;
}

export const ServiceAccountConfig = registerAs(
  ConfigNamespace.ServiceAccount,
  (): ServiceAccountConfigProvider => {
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
