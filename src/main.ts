import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // @TODO: configure CSRF (origin whitelist) - https://docs.nestjs.com/security/csrf
  // @TODO: configure CORS (trusted origins) (- https://docs.nestjs.com/security/cors
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
