import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RootModule } from '../../src/root.module';
import { PublicOfferLikes } from './interfaces/like';
import { Vote } from '../../src/like/interfaces/storage';
import { ServiceAccountConfig } from '../../src/app/config/namespace/service-account.config';
import {
  CREATOR_SERVICE_TOKEN,
  GENERIC_SERVICE_ACCOUNT_USER_TOKEN,
  NON_PARTICIPANT_SERVICE_TOKEN,
  PARTICIPANT_SERVICE_TOKEN,
  TEST_SERVICE_ACCOUNT_CONFIG,
} from '../util/helper';
import { Plugin } from '../../src/plugins';
import { LikeStorageProviderType } from '../../src/like/like.storage';

describe('LikeController (e2e) [authenticated]', () => {
  // MARK: - Properties
  let app: INestApplication;

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RootModule.register({
          plugins: new Set([Plugin.LikeApi]),
          optionsForPlugin: {
            [Plugin.LikeApi]: { storage: LikeStorageProviderType.InMemory },
          },
        }),
      ],
    })
      .overrideProvider(ServiceAccountConfig.KEY)
      .useValue(TEST_SERVICE_ACCOUNT_CONFIG)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // MARK: - Tests
  it('/offer/:offerId/likes (GET) - fails if `offerId` is not a UUID', () => {
    return request(app.getHttpServer())
      .get('/offer/offer-1/likes')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
      .expect(400);
  });

  it('/offer/:offerId/likes (GET) - succeeds if `offerId` is a UUID and returns total of `0` likes and no user like if offer has not been touched', async () => {
    const likes = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likes.total).toEqual(0);
    expect(likes.user).toBeUndefined();
  });

  it('/offer/:offerId/likes (PUT) - fails if `offerId` is not a UUID', () => {
    return request(app.getHttpServer())
      .put('/offer/offer-1/likes')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
      .expect(400);
  });

  it('/offer/:offerId/likes (PUT) - succeeds if `offerId` is a UUID and sets the total and user likes to `1`', async () => {
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
      .expect(200);

    const likes = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likes.total).toEqual(1);
    expect(likes.user).toBeDefined();
    expect(likes.user!).toEqual(Vote.Up);
  });

  it("/offer/:offerId/likes (PUT) - toggles a user's like", async () => {
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
      .expect(200);

    const likesAfterFirstToggle = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterFirstToggle.total).toEqual(1);
    expect(likesAfterFirstToggle.user!).toEqual(Vote.Up);

    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
      .expect(200);

    const likesAfterSecondToggle = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterSecondToggle.total).toEqual(0);
    expect(likesAfterSecondToggle.user!).toEqual(Vote.Neutral);

    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
      .expect(200);

    const likesAfterThirdToggle = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${GENERIC_SERVICE_ACCOUNT_USER_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterThirdToggle.total).toEqual(1);
    expect(likesAfterThirdToggle.user!).toEqual(Vote.Up);
  });
});

describe('LikeController (e2e) [multi-auth]', () => {
  // MARK: - Properties
  let app: INestApplication;

  const USER_1_SERVICE_TOKEN = CREATOR_SERVICE_TOKEN;
  const USER_2_SERVICE_TOKEN = PARTICIPANT_SERVICE_TOKEN;
  const USER_3_SERVICE_TOKEN = NON_PARTICIPANT_SERVICE_TOKEN;

  // MARK: - Hooks
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RootModule.register({
          plugins: new Set([Plugin.LikeApi]),
          optionsForPlugin: {
            [Plugin.LikeApi]: {
              storage: LikeStorageProviderType.InMemory,
            },
          },
        }),
      ],
    })
      .overrideProvider(ServiceAccountConfig.KEY)
      .useValue(TEST_SERVICE_ACCOUNT_CONFIG)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // MARK: - Tests
  it('/offer/:offerId/likes (PUT) - works independently for multiple user', async () => {
    // User 1
    // first toggle
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${USER_1_SERVICE_TOKEN}`)
      .expect(200);

    const likesAfterFirstToggleByUser1 = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${USER_1_SERVICE_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterFirstToggleByUser1.total).toEqual(1);
    expect(likesAfterFirstToggleByUser1.user!).toEqual(Vote.Up);

    // User 2
    // first toggle
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${USER_2_SERVICE_TOKEN}`)
      .expect(200);

    const likesAfterFirstToggleByUser2 = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${USER_2_SERVICE_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterFirstToggleByUser2.total).toEqual(2);
    expect(likesAfterFirstToggleByUser2.user!).toEqual(Vote.Up);

    // second toggle
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${USER_2_SERVICE_TOKEN}`)
      .expect(200);

    const likesAfterSecondToggleByUser2 = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${USER_2_SERVICE_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterSecondToggleByUser2.total).toEqual(1);
    expect(likesAfterSecondToggleByUser2.user!).toEqual(Vote.Neutral);

    // User 3
    // first toggle
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${USER_3_SERVICE_TOKEN}`)
      .expect(200);

    const likesAfterFirstToggleByUser3 = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${USER_3_SERVICE_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterFirstToggleByUser3.total).toEqual(2);
    expect(likesAfterFirstToggleByUser3.user!).toEqual(Vote.Up);

    // User 1
    // second toggle
    await request(app.getHttpServer())
      .put('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
      .set('Authorization', `Bearer ${USER_1_SERVICE_TOKEN}`)
      .expect(200);

    const likesAfterSecondToggleByUser1 = (
      await request(app.getHttpServer())
        .get('/offer/a35fe77b-7d4f-4da2-8d5d-271cf9d82fee/likes')
        .set('Authorization', `Bearer ${USER_1_SERVICE_TOKEN}`)
        .expect(200)
    ).body as PublicOfferLikes;

    expect(likesAfterSecondToggleByUser1.total).toEqual(1);
    expect(likesAfterSecondToggleByUser1.user!).toEqual(Vote.Neutral);
  });
});
