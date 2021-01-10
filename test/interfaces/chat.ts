export type UserUUID = string;
export type ChatUUID = string;
export type ChatMessageUUID = string;

export interface PublicChat {
  uuid: ChatUUID;
  creator: UserUUID;
  participants: UserUUID[]; // includes creator
}

export interface PublicChatMessage {
  uuid: ChatMessageUUID;
  chat: ChatUUID;
  sender: UserUUID;
  date: string;
  body: string;
}
