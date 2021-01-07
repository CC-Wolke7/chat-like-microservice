import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserUUID } from './storage';

// MARK: - Request Payload
export class CreateChatPayload {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(4, { each: true })
  participants: UserUUID[];
}

export class CreateMessagePayload {
  @IsString()
  message: string;
}

// MARK: - Response Payload
