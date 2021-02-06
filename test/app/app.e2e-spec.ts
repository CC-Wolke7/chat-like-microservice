import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RootModule } from '../../src/root.module';
import { HealthStatus } from '../../src/app/interfaces/health';
import {
  AnonymousUser,
  AuthenticatedUser,
  UserType,
} from '../../src/app/auth/interfaces/user';
import { ServiceAccount } from '../../src/app/auth/interfaces/service-account';
import { ServiceAccountConfig } from '../../src/app/config/namespace/service-account.config';
import {
  GENERIC_SERVICE_ACCOUNT_TOKEN,
  TEST_SERVICE_ACCOUNT_CONFIG,
} from '../util/helper';
import * as nock from 'nock';
import { CoreConfig } from '../../src/app/config/namespace/core.config';

describe('AppController (e2e)', () => {
  // MARK: - Properties
  let app: INestApplication;
  const { vetShelter } = CoreConfig();

  // const GOOGLE_OAUTH_JWT =
  //   'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijc4M2VjMDMxYzU5ZTExZjI1N2QwZWMxNTcxNGVmNjA3Y2U2YTJhNmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiODgyNTE3NzIyNTk3LTNwNmoxa29qODRvYTI3a3Y0YmM5dDU4ZWdpYW5xZjNlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiODgyNTE3NzIyNTk3LTNwNmoxa29qODRvYTI3a3Y0YmM5dDU4ZWdpYW5xZjNlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAzMDkyNjM0OTg2MjQ5Nzk5MTkwIiwiZW1haWwiOiJrbGF1c2Z1aHJtZWlzdGVyOTFAZ29vZ2xlbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Imw1dnE4VWVRMXAwSk5YV2Nibi1LNkEiLCJuYW1lIjoiS2xhdXMgRiIsInBpY3R1cmUiOiJodHRwczovL2xoNS5nb29nbGV1c2VyY29udGVudC5jb20vLS1faTJURGxWMWUwL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y21ZTDB6RFRVUFBPVUlmeWZZUUVibGdZUXNGVFEvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6IktsYXVzIiwiZmFtaWx5X25hbWUiOiJGIiwibG9jYWxlIjoiZGUiLCJpYXQiOjE2MTExNDM0NjksImV4cCI6MTYxMTE0NzA2OSwianRpIjoiNmRlMjQzNWVhMjIyMTlhMTIwMjVjNmVhYzRiMzYxN2JkNmNhNDI5NCJ9.NZQx5I_KgBxxVr-IkDUDXrhZivyjQUzk3ZpdNmIFgusgQCMXx7U7P4xYoYTm4IX-cQ3hvpR2vJ4uHK1pEzlllwsiaPUV1gvDtgp-jWmygdmvCJ8JHcTLOWZB8L-Xy0qS3gXxUJONsG0rmdojbpAghzUcPFNdxYIVBNgGWWh6g2s9qs-8X20EISeU8xHEcvIKtgYD6Lt2LG-xZnIOQdtGtmhaIA50RGt0NHuMr_kUMdok3N8CNnGpN9OulFRaiwhSu5Ta3DZJ235Ii0yBqwlKk0Gvmj4HBWL1HDvJ_Uv_5Fadg9LO8ZuF-XM9gTfEV0JTqWBW-3b57eDPeu5f4_vW1Q';
  // const GOOGLE_OAUTH_SUB = '103092634986249799190';

  const VET_SHELTER_JWT =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjEyNjUxMjM4LCJqdGkiOiIyYzE1NTA3NDljNzE0YTJjOWQ5Yjg5NzRjZDE2MzI3ZiIsInVzZXJfaWQiOjJ9.rfF7g2kox0y4G2RXehM2g1gKumfA4ajcmTv7W66bZ80';
  const VET_SHELTER_USER_ID = '2';

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RootModule.register({ plugins: new Set([]), optionsForPlugin: {} }),
      ],
    })
      .overrideProvider(ServiceAccountConfig.KEY)
      .useValue(TEST_SERVICE_ACCOUNT_CONFIG)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    // Cleanup prepared mocks (and associated state)
    nock.cleanAll();
  });

  afterAll(() => {
    // Restore HTTP interceptor to normal unmocked behaviour
    nock.restore();
  });

  // MARK: - Tests
  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: HealthStatus.Normal });
  });

  it('/identity (GET) - should succeed if not authenticated', async () => {
    const identity: AnonymousUser = (
      await request(app.getHttpServer()).get('/identity').expect(200)
    ).body;

    expect(identity.type).toEqual(UserType.Anonymous);
  });

  it('/identity (GET) - should succeed if authenticated through service token', async () => {
    const identity: ServiceAccount = (
      await request(app.getHttpServer())
        .get('/identity')
        .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_TOKEN}`)
        .expect(200)
    ).body;

    expect(identity.type).toEqual(UserType.ServiceAccount);
    expect(identity.name).toEqual(
      TEST_SERVICE_ACCOUNT_CONFIG.accountForToken[GENERIC_SERVICE_ACCOUNT_TOKEN]
        .name,
    );
    expect(identity.uuid).toEqual(
      TEST_SERVICE_ACCOUNT_CONFIG.accountForToken[GENERIC_SERVICE_ACCOUNT_TOKEN]
        .uuid,
    );
  });

  // it('/identity (GET) - should succeed if authenticated through Google OAuth', async () => {
  //   const identity: AuthenticatedUser = (
  //     await request(app.getHttpServer())
  //       .get('/identity')
  //       .set('Authorization', `Bearer ${GOOGLE_OAUTH_JWT}`)
  //       .expect(200)
  //   ).body;

  //   expect(identity.type).toEqual(UserType.User);
  //   expect(identity.uuid).toEqual(GOOGLE_OAUTH_SUB);
  // });

  it('/identity (GET) - should succeed if authenticated through vet shelter', async () => {
    const verifyTokenMock = nock(vetShelter.apiUrl)
      .post('/api/token/verify')
      .reply(200);

    const identity: AuthenticatedUser = (
      await request(app.getHttpServer())
        .get('/identity')
        .set('Authorization', `Bearer ${VET_SHELTER_JWT}`)
        .expect(200)
    ).body;

    expect(identity.type).toEqual(UserType.User);
    expect(identity.uuid).toEqual(VET_SHELTER_USER_ID);
    expect(verifyTokenMock.isDone()).toBeTruthy();
  });

  it('/auth-identity (GET) - should fail if not authenticated', () => {
    return request(app.getHttpServer()).get('/auth-identity').expect(401);
  });

  it('/auth-identity (GET) - should succeed if authenticated through service token', () => {
    return request(app.getHttpServer())
      .get('/auth-identity')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_TOKEN}`)
      .expect(200);
  });

  // it('/auth-identity (GET) - should succeed if authenticated through Google OAuth', () => {
  //   return request(app.getHttpServer())
  //     .get('/auth-identity')
  //     .set('Authorization', `Bearer ${GOOGLE_OAUTH_JWT}`)
  //     .expect(200);
  // });

  it('/auth-identity (GET) - should succeed if authenticated through vet shelter', async () => {
    const verifyTokenMock = nock(vetShelter.apiUrl)
      .post('/api/token/verify')
      .reply(200);

    await request(app.getHttpServer())
      .get('/auth-identity')
      .set('Authorization', `Bearer ${VET_SHELTER_JWT}`)
      .expect(200);

    expect(verifyTokenMock.isDone()).toBeTruthy();
  });

  it('/auth-identity (GET) - should fail if vet shelter authentication is invalid', async () => {
    const verifyTokenMock = nock(vetShelter.apiUrl)
      .post('/api/token/verify')
      .reply(401);

    await request(app.getHttpServer())
      .get('/auth-identity')
      .set('Authorization', `Bearer ${VET_SHELTER_JWT}`)
      .expect(401);

    expect(verifyTokenMock.isDone()).toBeTruthy();
  });
});
