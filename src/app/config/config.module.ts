import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ChatConfig } from './namespace/chat.config';
import { CoreConfig } from './namespace/core.config';
import { validate } from './environment';
import { LikeConfig } from './namespace/like.config';
import { ServiceAccountConfig } from './namespace/service-account.config';

// https://github.com/nestjs/config/issues/82
// https://github.com/nestjs/config/issues/287#issuecomment-676340140
// @TODO: move to indiviual plugins to allow dynamic loading with non-optional typing

function getEnvFiles(): string[] {
  const files: string[] = [];

  switch (process.env.NODE_ENV) {
    case 'production':
      files.push(...['.env.production']);
      break;
    case 'development':
      files.push(...['.env.development', '.env.development.local']);
      break;
    case 'test':
      files.push(...['.env.test']);
      break;
    default:
      break;
  }

  return ['.env', ...files];
}

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: getEnvFiles(),
      load: [CoreConfig, ServiceAccountConfig, ChatConfig, LikeConfig],
      cache: true,
      validate,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
