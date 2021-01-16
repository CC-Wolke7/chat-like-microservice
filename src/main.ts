import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { RootModule } from './root.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  // @TODO: support horizontal WS scaling
  // https://goldfirestudios.com/horizontally-scaling-node-js-and-websockets-with-redis
  // https://tsh.io/blog/how-to-scale-websocket/
  //
  // @TODO: configure CSRF (origin whitelist) - https://docs.nestjs.com/security/csrf
  // @TODO: configure CORS (trusted origins) (- https://docs.nestjs.com/security/cors
  const app = await NestFactory.create(RootModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  const specOptions = new DocumentBuilder()
    .setTitle('Chat Microservice')
    .setVersion('1.0')
    .addTag('app')
    .addTag('chat')
    .addTag('like')
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, specOptions),
  );

  await app.listen(3000);
}

bootstrap();
