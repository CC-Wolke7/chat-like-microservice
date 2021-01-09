import { Controller, Get } from '@nestjs/common';
import { HealthStatus } from './interfaces/health';

@Controller()
export class AppController {
  // MARK: - Routes
  @Get()
  getHealth(): HealthStatus {
    return HealthStatus.Normal;
  }
}
