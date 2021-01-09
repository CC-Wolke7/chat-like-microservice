import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserUUID } from './storage';

// MARK: - Request Query
export class GetChatsQuery {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID(4, { each: true })
  participants?: UserUUID[];
}

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
// @TODO: add serialization model - https://docs.nestjs.com/techniques/serialization
