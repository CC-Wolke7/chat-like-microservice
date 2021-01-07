import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // MARK: - Routes
  @Get()
  health(): string {
    return 'OK';
  }
}
