import { Controller, Get } from '@nestjs/common';
import { HealthStatus } from './interfaces/health';
import { ApiTags } from '@nestjs/swagger';
import { HealthStatusResponse } from './app.dto';

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
}
