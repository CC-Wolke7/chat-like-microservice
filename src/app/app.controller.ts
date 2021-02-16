import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthStatus } from './interfaces/health';
import { ApiTags } from '@nestjs/swagger';
import { HealthStatusResponse } from './app.dto';
import { AuthenticatedUserEntity, UserEntity } from './auth/interfaces/user';
import { User } from './auth/user.decorator';
import {
  OrAuthGuard,
  AnonymousGuard,
  ServiceTokenGuard,
  VetShelterAuthGuard,
} from './auth/auth.guard';

@ApiTags('app')
@Controller()
export class AppController {
  // MARK: - Routes
  @Get('health')
  getHealth(): HealthStatusResponse {
    return {
      status: HealthStatus.Normal,
    };
  }

  @UseGuards(
    new OrAuthGuard(
      new AnonymousGuard(),
      new ServiceTokenGuard(),
      new VetShelterAuthGuard(),
    ),
  )
  @Get('identity')
  getIdentity(@User() user: UserEntity): UserEntity {
    return user;
  }

  @UseGuards(
    new OrAuthGuard(new ServiceTokenGuard(), new VetShelterAuthGuard()),
  )
  @Get('auth-identity')
  getAuthenticatedIdentity(
    @User() user: AuthenticatedUserEntity,
  ): AuthenticatedUserEntity {
    return user;
  }

  // MARK: App Engine
  @Get('_ah/warmup')
  warmup(): void {
    return;
  }
}
