export enum Plugin {
  ChatApi = 'CHAT_API',
  LikeApi = 'LIKE_API',
}

export const ALL_PLUGINS = new Set([Plugin.ChatApi, Plugin.LikeApi]);
