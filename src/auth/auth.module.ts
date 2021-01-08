import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AnonymousStrategy } from './anonymous/anonymous.strategy';
import { ServiceTokenStrategy } from './service-token/service-token.strategy';

@Module({
  imports: [PassportModule],
  providers: [AnonymousStrategy, ServiceTokenStrategy],
})
export class AuthModule {}
