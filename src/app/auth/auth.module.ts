import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { AnonymousStrategy } from './strategy/anonymous.strategy';
import { GoogleOAuthStrategy } from './strategy/google-oauth.strategy';
import { ServiceTokenStrategy } from './strategy/service-token.strategy';
import { VetShelterStrategy } from './strategy/vet-shelter.strategy';

@Module({
  imports: [ConfigModule, PassportModule],
  providers: [
    AnonymousStrategy,
    ServiceTokenStrategy,
    GoogleOAuthStrategy,
    VetShelterStrategy,
  ],
  exports: [
    AnonymousStrategy,
    ServiceTokenStrategy,
    GoogleOAuthStrategy,
    VetShelterStrategy,
  ],
})
export class AuthModule {}
