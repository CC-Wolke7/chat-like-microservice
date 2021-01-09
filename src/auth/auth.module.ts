import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { AnonymousStrategy } from './anonymous/anonymous.strategy';
import { ServiceTokenStrategy } from './service-token/service-token.strategy';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [AnonymousStrategy, ServiceTokenStrategy],
})
export class AuthModule {}
