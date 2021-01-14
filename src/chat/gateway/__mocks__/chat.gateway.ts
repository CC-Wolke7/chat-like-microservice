import { ChatNotificationProvider } from '../../interfaces/notification';
import { ChatModel, ChatMessageModel } from '../../interfaces/storage';

export class ChatGatewayMock implements ChatNotificationProvider {
  // MARK: - Private Properties
  // MARK: - Public Methods
  // MARK: Chat Notification Provider
  async notifyChatCreated(chat: ChatModel): Promise<void> {
    // send chat to chat participants (excluding creator)
  }

  async notifyMessageCreated(
    chat: ChatModel,
    message: ChatMessageModel,
  ): Promise<void> {
    // send message to chat participants (excluding sender)
  }
}
