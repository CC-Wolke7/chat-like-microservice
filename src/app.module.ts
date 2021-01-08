import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { ChatModule } from './chat/chat.module';
import { logger } from './middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';

const ValidationPipeProvider: Provider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
};

@Module({
  imports: [AuthModule, ChatModule],
  controllers: [AppController],
  providers: [ValidationPipeProvider],
})
export class AppModule implements NestModule {
  // MARK: - Initialization
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(logger).forRoutes('*');
  }
}
