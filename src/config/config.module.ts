import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './environment';
import serviceAccountConfig from './service-account.config';

// https://github.com/nestjs/config/issues/82
// https://github.com/nestjs/config/issues/287#issuecomment-676340140
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        '.env.development.production',
        '.env.development.local',
        '.env.development',
        '.env',
      ],
      load: [serviceAccountConfig],
      cache: true,
      validate,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
