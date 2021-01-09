import { Chat, ChatMessage } from './storage';

// MARK: - Provider
export interface ChatNotificationProvider {
  notifyChatCreated(chat: Chat): Promise<void>;
  notifyMessageCreated(chat: Chat, message: ChatMessage): Promise<void>;
}
