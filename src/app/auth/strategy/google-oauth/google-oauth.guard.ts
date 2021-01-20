import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthStrategyName } from '../../strategy';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard(AuthStrategyName.GoogleOAuth) {}
