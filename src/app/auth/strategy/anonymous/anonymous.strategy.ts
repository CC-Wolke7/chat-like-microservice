import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-anonymous';
import { AnonymousUser, UserType } from '../../interfaces/user';
import { AuthStrategyName } from '../../strategy';

export class AnonymousStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.Anonymous,
) {
  // MARK: - Public Methods
  validate(): AnonymousUser {
    return {
      type: UserType.Anonymous,
    };
  }
}