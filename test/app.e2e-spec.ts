import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RootModule } from '../src/root.module';

describe('AppController (e2e)', () => {
  // MARK: - Properties
  let app: INestApplication;

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RootModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // MARK: - Tests
  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('OK');
  });
});
