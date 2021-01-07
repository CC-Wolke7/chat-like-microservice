import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Chat } from './interfaces/storage';

@Injectable()
export class ChatByUUIDPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): Chat {
    return value as any;
  }
}

@Injectable()
export class IsChatParticipantGuard implements PipeTransform<Chat, Chat> {
  transform(value: Chat, metadata: ArgumentMetadata): Chat {
    return value as any;
  }
}
