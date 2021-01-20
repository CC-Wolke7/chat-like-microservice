import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { AnonymousStrategy } from './strategy/anonymous/anonymous.strategy';
import { GoogleOAuthStrategy } from './strategy/google-oauth/google-oauth.strategy';
import { ServiceTokenStrategy } from './strategy/service-token/service-token.strategy';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [AnonymousStrategy, ServiceTokenStrategy, GoogleOAuthStrategy],
  exports: [AnonymousStrategy, ServiceTokenStrategy, GoogleOAuthStrategy],
})
export class AuthModule {}
