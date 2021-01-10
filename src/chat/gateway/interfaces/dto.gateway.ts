import { IsString, IsUUID } from 'class-validator';
import { ChatUUID } from '../../interfaces/storage';

// MARK: - Event Payload
export class CreateMessageEventPayload {
  @IsUUID(4)
  chat: ChatUUID;

  @IsString()
  message: string;
}
