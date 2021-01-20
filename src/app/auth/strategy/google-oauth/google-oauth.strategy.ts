import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AuthenticatedUser, UserType } from '../../interfaces/user';
import { AuthStrategyName } from '../../strategy';

interface GoogleOAuthIdTokenPayload {
  iss: string; // issuer
  aud: string; // audience;
  sub: string; // subject
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  iat: number; // issued at (unix)
  exp: number; // expiration at (unix)
}

// https://accounts.google.com/.well-known/openid-configuration
@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.GoogleOAuth,
) {
  // MARK: - Initialization
  constructor() {
    // @TODO: configure to match rotation interval
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
      }),
      // issuer,
      algorithms: ['RS256'],
      ignoreExpiration: true,
    };

    super(options);
  }

  // MARK: - Public Methods
  validate(payload: GoogleOAuthIdTokenPayload): AuthenticatedUser {
    // @TODO: convert to unique uuid
    return {
      type: UserType.User,
      uuid: payload.sub,
    };
  }
}
