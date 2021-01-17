import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ChatConfig } from './namespace/chat.config';
import { CoreConfig } from './namespace/core.config';
import { validate } from './environment';
import { LikeConfig } from './namespace/like.config';
import { ServiceAccountConfig } from './namespace/service-account.config';

// https://github.com/nestjs/config/issues/82
// https://github.com/nestjs/config/issues/287#issuecomment-676340140
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        '.env.test',
        '.env.development.local',
        '.env.development',
        '.env.production',
        '.env',
      ],
      load: [CoreConfig, ServiceAccountConfig, ChatConfig, LikeConfig],
      cache: true,
      validate,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
