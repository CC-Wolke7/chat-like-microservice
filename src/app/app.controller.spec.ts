import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { HealthStatus } from './interfaces/health';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return "OK"', () => {
      expect(appController.getHealth().status).toBe(HealthStatus.Normal);
    });
  });
});
