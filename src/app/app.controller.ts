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
  GoogleOAuthGuard,
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
      new GoogleOAuthGuard(),
    ),
  )
  @Get('identity')
  getIdentity(@User() user: UserEntity): UserEntity {
    return user;
  }

  @UseGuards(new OrAuthGuard(new ServiceTokenGuard(), new GoogleOAuthGuard()))
  @Get('auth-identity')
  getAuthenticatedIdentity(
    @User() user: AuthenticatedUserEntity,
  ): AuthenticatedUserEntity {
    return user;
  }
}
