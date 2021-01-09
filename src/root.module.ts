import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { logger } from './middleware/logger.middleware';

const ValidationPipeProvider: Provider = {
  provide: APP_PIPE,
  useValue: new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
};

@Module({
  imports: [AuthModule, AppModule, ChatModule],
  providers: [ValidationPipeProvider],
})
export class RootModule implements NestModule {
  // MARK: - Initialization
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(logger).forRoutes('*');
  }
}
