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
export type ChatPrototype = Omit<ChatModel, 'uuid'>;
export type ChatMessagePrototype = Omit<ChatMessageModel, 'uuid'>;

export interface ChatStorageProvider {
  getChat(uuid: ChatUUID): Promise<ChatModel | undefined>;
  createChat(chat: ChatPrototype): Promise<ChatModel>;
  findChatsByParticipants(
    participants: Set<UserUUID>,
    strictEqual: boolean,
  ): Promise<ChatModel[]>;

  getMessage(uuid: ChatMessageUUID): Promise<ChatMessageModel | undefined>;
  createMessage(message: ChatMessagePrototype): Promise<ChatMessageModel>;
  findMessagesByChat(chat: ChatUUID): Promise<ChatMessageModel[]>;
}
