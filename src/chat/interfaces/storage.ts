// MARK: - Model
export type UserUUID = string;
export type ChatUUID = string;
export type ChatMessageUUID = string;

export interface ChatModel {
  uuid: ChatUUID;
  creator: UserUUID;
  participants: UserUUID[]; // includes creator
}

export interface ChatMessageModel {
  uuid: ChatMessageUUID;
  chat: ChatUUID;
  sender: UserUUID;
  date: Date;
  body: string;
}

// MARK: - Provider
export type ChatFilter = (chat: ChatModel) => boolean;
export type ChatMessageFilter = (message: ChatMessageModel) => boolean;

export interface ChatStorageProvider {
  findChat(filter: ChatFilter): Promise<ChatModel | undefined>;
  findChats(filter: ChatFilter): Promise<ChatModel[]>;
  createChat(chat: Omit<ChatModel, 'uuid'>): Promise<ChatModel>;

  findMessage(filter: ChatMessageFilter): Promise<ChatMessageModel | undefined>;
  findMessages(filter: ChatMessageFilter): Promise<ChatMessageModel[]>;
  createMessage(
    message: Omit<ChatMessageModel, 'uuid'>,
  ): Promise<ChatMessageModel>;
}
