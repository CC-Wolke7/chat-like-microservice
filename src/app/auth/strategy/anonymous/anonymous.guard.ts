import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyName } from '../../strategy';

@Injectable()
export class AnonymousGuard extends AuthGuard(AuthStrategyName.Anonymous) {}
