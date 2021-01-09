import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { RootModule } from './root.module';

async function bootstrap(): Promise<void> {
  // @TODO: support horizontal WS scaling
  // https://goldfirestudios.com/horizontally-scaling-node-js-and-websockets-with-redis
  // https://tsh.io/blog/how-to-scale-websocket/
  //
  // @TODO: setup application level logging - https://docs.nestjs.com/techniques/logger
  // @TODO: configure CSRF (origin whitelist) - https://docs.nestjs.com/security/csrf
  // @TODO: configure CORS (trusted origins) (- https://docs.nestjs.com/security/cors
  const app = await NestFactory.create(RootModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(3000);
}

bootstrap();
