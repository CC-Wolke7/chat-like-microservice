import {
  DynamicModule,
  InternalServerErrorException,
  MiddlewareConsumer,
  NestModule,
  Provider,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LoggerMiddleware } from './app/middleware/logger.middleware';
import { AppException } from './app/app.exception';
import { Plugin } from './plugins';
import { ChatModule } from './chat/chat.module';
import { LikeModule } from './like/like.module';

const MODULE_FOR_PLUGIN: Map<Plugin, Type<any>> = new Map([
  [Plugin.ChatApi, ChatModule],
  [Plugin.LikeApi, LikeModule],
]);

interface RootModuleOptions {
  plugins: Set<Plugin>;
}

export class RootModule implements NestModule {
  // MARK: - Public Static Methods
  public static register(options: RootModuleOptions): DynamicModule {
    const { plugins } = options;

    const modules = Array.from(plugins).map((plugin) => {
      const module = MODULE_FOR_PLUGIN.get(plugin);

      if (!module) {
        throw new InternalServerErrorException(AppException.NoModuleForPlugin);
      }

      return module;
    });

    const ValidationPipeProvider: Provider = {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    };

    // @TODO: add serialization interceptor - https://docs.nestjs.com/techniques/serialization

    return {
      module: RootModule,
      imports: [AppModule, ...modules],
      providers: [ValidationPipeProvider],
    };
  }

  // MARK: - Public Methods
  // MARK: NestModule
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
