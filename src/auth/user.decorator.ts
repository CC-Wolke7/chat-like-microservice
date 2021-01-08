import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from './interfaces/user';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user as UserEntity;
  },
);
