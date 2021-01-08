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
export type ChatFilter = (chat: Chat) => boolean;
export type ChatMessageFilter = (message: ChatMessage) => boolean;

export interface ChatStorageProvider {
  findChat(filter: ChatFilter): Promise<Chat | undefined>;
  findChats(filter: ChatFilter): Promise<Chat[]>;
  createChat(chat: Omit<Chat, 'uuid'>): Promise<Chat>;

  findMessage(filter: ChatMessageFilter): Promise<ChatMessage | undefined>;
  findMessages(filter: ChatMessageFilter): Promise<ChatMessage[]>;
  createMessage(message: Omit<ChatMessage, 'uuid'>): Promise<ChatMessage>;
}
