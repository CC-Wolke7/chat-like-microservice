import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { AuthStrategyName } from '../strategy';
import { AuthenticatedUser, UserType } from '../interfaces/user';
import axios, { AxiosInstance } from 'axios';
import {
  CoreConfig,
  CoreConfigProvider,
} from '../../config/namespace/core.config';
import jwt_decode from 'jwt-decode';

interface VetShelterJwtPayload {
  token_type: 'access';
  exp: number;
  jti: string;
  sub: string;
  name: string;
  email: string;
}

@Injectable()
export class VetShelterStrategy extends PassportStrategy(
  Strategy,
  AuthStrategyName.VetShelter,
) {
  // MARK: - Private Properties
  private readonly client: AxiosInstance;

  // MARK: - Initialization
  constructor(
    @Inject(CoreConfig.KEY) { vetShelter: { apiUrl } }: CoreConfigProvider,
  ) {
    super();

    this.client = axios.create({
      baseURL: apiUrl,
    });
  }

  // MARK: - Public Methods
  async validate(token: string): Promise<AuthenticatedUser> {
    await this.client.post(`/api/token/verify`, {
      token: token,
    });

    const decodedToken: VetShelterJwtPayload = jwt_decode(token);

    return {
      type: UserType.User,
      uuid: decodedToken.sub,
    };
  }
}
