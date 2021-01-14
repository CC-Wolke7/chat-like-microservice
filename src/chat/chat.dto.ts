import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ChatMessageUUID, ChatUUID, UserUUID } from './interfaces/storage';

// MARK: - Request Query
export class GetChatsQuery {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(4, { each: true })
  readonly participants?: UserUUID[];
}

// MARK: - Request Payload
export class CreateChatPayload {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(4, { each: true })
  readonly participants: UserUUID[];
}

export class CreateMessagePayload {
  @IsString()
  readonly message: string;
}

// MARK: - Response Payload
export class Chat {
  readonly uuid: ChatUUID;
  readonly creator: UserUUID;
  readonly participants: UserUUID[];
}

export class ChatMessage {
  readonly uuid: ChatMessageUUID;
  readonly chat: ChatUUID;
  readonly sender: UserUUID;
  readonly date: Date;
  readonly body: string;
}

export type GetChatsResponse = Chat[];
export type CreateChatResponse = Chat;
export type GetChatMessagesResponse = ChatMessage[];
export type CreateChatMessageResponse = ChatMessage;
