import {
  ServiceAccount,
  ServiceAccountName,
} from '../../auth/interfaces/service-account';
import { Environment } from '../environment';
import { registerAs } from '@nestjs/config';
import { ConfigNamespace } from '../namespace';

type Token = string;

export interface ServiceAccountConfigProvider {
  tokenWhitelist: string[];
  accountForToken: Record<Token, Omit<ServiceAccount, 'type'>>;
}

export const ServiceAccountConfig = registerAs(
  ConfigNamespace.ServiceAccount,
  (): ServiceAccountConfigProvider => {
    const environment = (process.env as unknown) as Environment;
    const { RECOMMENDER_BOT_TOKEN, RECOMMENDER_BOT_USER_UUID } = environment;

    return {
      tokenWhitelist: [RECOMMENDER_BOT_TOKEN],
      accountForToken: {
        [RECOMMENDER_BOT_TOKEN]: {
          name: ServiceAccountName.RecommenderBot,
          uuid: RECOMMENDER_BOT_USER_UUID,
        },
      },
    };
  },
);
