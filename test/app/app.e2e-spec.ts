import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RootModule } from '../../src/root.module';
import { HealthStatus } from '../../src/app/interfaces/health';

describe('AppController (e2e)', () => {
  // MARK: - Properties
  let app: INestApplication;

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RootModule.register({ plugins: new Set([]), optionsForPlugin: {} }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // MARK: - Tests
  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: HealthStatus.Normal });
  });
});
