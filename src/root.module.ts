import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ChatModule } from './chat/chat.module';
import { LoggerMiddleware } from './app/middleware/logger.middleware';

const ValidationPipeProvider: Provider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
};

@Module({
  imports: [AppModule, ChatModule],
  providers: [ValidationPipeProvider],
})
export class RootModule implements NestModule {
  // MARK: - Initialization
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
