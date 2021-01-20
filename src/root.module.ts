import {
  DynamicModule,
  MiddlewareConsumer,
  NestModule,
  Provider,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LoggerMiddleware } from './app/middleware/logger.middleware';
import { Plugin, PluginFactory, PluginFactoryOptions } from './plugins';
import { LikeModuleFactory } from './like/like.module';
import { ChatModuleFactory } from './chat/chat.module';

const FACTORY_FOR_PLUGIN: Record<Plugin, Type<PluginFactory>> = {
  [Plugin.ChatApi]: ChatModuleFactory,
  [Plugin.LikeApi]: LikeModuleFactory,
};

interface RootModuleOptions {
  plugins: Set<Plugin>;
  optionsForPlugin: Record<string, PluginFactoryOptions | undefined>;
}

export class RootModule implements NestModule {
  // MARK: - Public Static Methods
  public static register(options: RootModuleOptions): DynamicModule {
    const { plugins, optionsForPlugin } = options;

    const modules = Array.from(plugins).map((plugin) => {
      const Factory = FACTORY_FOR_PLUGIN[plugin];
      const options = optionsForPlugin[plugin];

      return new Factory().create(options);
    });

    const validationPipe: Provider = {
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
      providers: [validationPipe],
    };
  }

  // MARK: - Public Methods
  // MARK: NestModule
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
