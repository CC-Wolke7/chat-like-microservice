import { IsString, IsUUID } from 'class-validator';
import { ChatUUID } from '../interfaces/storage';

// MARK: - Event Payload
export class CreateMessageEventPayload {
  @IsUUID(4)
  readonly chat: ChatUUID;

  @IsString()
  readonly message: string;
}
