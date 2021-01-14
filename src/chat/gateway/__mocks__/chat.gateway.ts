import { ChatNotificationProvider } from '../../interfaces/notification';
import { Chat, ChatMessage } from '../../interfaces/storage';

export class ChatGatewayMock implements ChatNotificationProvider {
  // MARK: - Private Properties
  // MARK: - Public Methods
  // MARK: Chat Notification Provider
  async notifyChatCreated(chat: Chat): Promise<void> {
    // send chat to chat participants (excluding creator)
  }

  async notifyMessageCreated(chat: Chat, message: ChatMessage): Promise<void> {
    // send message to chat participants (excluding sender)
  }
}
