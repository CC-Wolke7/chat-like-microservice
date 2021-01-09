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
  date: string;
  body: string;
}
