import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthStatus } from './interfaces/health';
import { ApiTags } from '@nestjs/swagger';
import { HealthStatusResponse } from './app.dto';
import { GoogleOAuthGuard } from './auth/strategy/google-oauth/google-oauth.guard';
import { AuthenticatedUser } from './auth/interfaces/user';
import { User } from './auth/user.decorator';

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

  @UseGuards(GoogleOAuthGuard)
  @Get('identity')
  getIdentity(@User() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }
}
