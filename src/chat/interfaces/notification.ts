import { ChatModel, ChatMessageModel } from './storage';

// MARK: - Provider
export interface ChatNotificationProvider {
  notifyChatCreated(chat: ChatModel): Promise<void>;
  notifyMessageCreated(
    chat: ChatModel,
    message: ChatMessageModel,
  ): Promise<void>;
}
