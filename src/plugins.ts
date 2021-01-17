import { DynamicModule } from '@nestjs/common';

export enum Plugin {
  ChatApi = 'CHAT_API',
  LikeApi = 'LIKE_API',
}

export const ALL_PLUGINS = new Set([Plugin.ChatApi, Plugin.LikeApi]);

export type PluginFactoryOptions = Record<string, any>;

export interface PluginFactory {
  create(options?: PluginFactoryOptions): DynamicModule;
}
