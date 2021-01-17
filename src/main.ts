import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { CoreConfig } from './app/config/core.config';
import { setupDocs } from './docs';
import { RootModule } from './root.module';

async function bootstrap(): Promise<void> {
  // @TODO: support horizontal WS scaling
  // https://goldfirestudios.com/horizontally-scaling-node-js-and-websockets-with-redis
  // https://tsh.io/blog/how-to-scale-websocket/
  //
  // @TODO: configure CSRF (origin whitelist) - https://docs.nestjs.com/security/csrf
  // @TODO: configure CORS (trusted origins) (- https://docs.nestjs.com/security/cors

  const { plugins } = CoreConfig();

  const app = await NestFactory.create(
    RootModule.register({
      plugins,
    }),
  );

  app.useWebSocketAdapter(new WsAdapter(app));

  setupDocs(app, plugins);

  await app.listen(3000);
}

bootstrap();
