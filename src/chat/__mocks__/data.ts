import { ChatModel, ChatMessageModel } from '../interfaces/storage';

export const CHATS: ChatModel[] = [
  {
    uuid: 'chat-1',
    creator: 'user-1',
    participants: ['user-1', 'user-2'],
  },
];

export const CHAT_MESSAGES: ChatMessageModel[] = [
  {
    uuid: 'message-1',
    chat: 'chat-1',
    sender: 'user-1',
    date: new Date(),
    body: 'Hey there 👋🏾',
  },
  {
    uuid: 'message-2',
    chat: 'chat-1',
    sender: 'user-1',
    date: new Date(),
    body: 'Hey, how are you?',
  },
  {
    uuid: 'message-3',
    chat: 'chat-1',
    sender: 'user-1',
    date: new Date(),
    body: 'You around?',
  },
];
