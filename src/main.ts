import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { ChatConfig } from './app/config/namespace/chat.config';
import { CoreConfig } from './app/config/namespace/core.config';
import { LikeConfig } from './app/config/namespace/like.config';
import { setupDocs } from './docs';
import { Plugin } from './plugins';
import { RootModule } from './root.module';

async function bootstrap(): Promise<void> {
  // @TODO: support horizontal WS scaling
  // https://goldfirestudios.com/horizontally-scaling-node-js-and-websockets-with-redis
  // https://tsh.io/blog/how-to-scale-websocket/
  //
  // @TODO: configure CSRF (origin whitelist) - https://docs.nestjs.com/security/csrf
  // @TODO: configure CORS (trusted origins) (- https://docs.nestjs.com/security/cors
  const { plugins } = CoreConfig();
  const { storage: chatStorage } = ChatConfig();
  const { storage: likeStorage } = LikeConfig();

  const app = await NestFactory.create(
    RootModule.register({
      plugins,
      optionsForPlugin: {
        [Plugin.ChatApi]: {
          chatStorage,
        },
        [Plugin.LikeApi]: {
          likeStorage,
        },
      },
    }),
  );

  app.useWebSocketAdapter(new WsAdapter(app));
  setupDocs(app, plugins);
  await app.listen(3000);
}

bootstrap();
