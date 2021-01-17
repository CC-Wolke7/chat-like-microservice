import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Plugin } from './plugins';

export const API_TAG_FOR_PLUGIN: Map<Plugin, string> = new Map([
  [Plugin.ChatApi, 'chat'],
  [Plugin.LikeApi, 'like'],
]);

export function setupDocs(app: INestApplication, plugins: Set<Plugin>): void {
  const specOptions = new DocumentBuilder()
    .setTitle('Microservices')
    .setVersion('1.0')
    .addTag('app');

  for (const plugin of plugins) {
    const apiTag = API_TAG_FOR_PLUGIN.get(plugin);

    if (!apiTag) {
      continue;
    }

    specOptions.addTag(apiTag);
  }

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, specOptions.build()),
  );
}
