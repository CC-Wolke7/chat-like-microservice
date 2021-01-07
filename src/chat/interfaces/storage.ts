// MARK: - Model
export type UserUUID = string;
export type ChatUUID = string;
export type ChatMessageUUID = string;

export interface Chat {
  uuid: ChatUUID;
  creator: UserUUID;
  participants: UserUUID[]; // includes creator
}

export interface ChatMessage {
  uuid: ChatMessageUUID;
  chat: ChatUUID;
  sender: UserUUID;
  date: Date;
  body: string;
}

// MARK: - Provider
export interface ChatStorageProvider {
  findChats(filter: (chat: Chat) => boolean): Promise<Chat[]>;
  createChat(chat: Omit<Chat, 'uuid'>): Promise<Chat>;
  findMessages(
    filter: (message: ChatMessage) => boolean,
  ): Promise<ChatMessage[]>;
  createMessage(message: Omit<ChatMessage, 'uuid'>): Promise<ChatMessage>;
}
