import { IsString } from 'class-validator';

// MARK: - Event Payload
export class WsAuthRequestPayload {
  @IsString()
  readonly token: string;
}

// MARK: - Response Payload
export enum WsAuthStatus {
  Unauthorized = 'UNAUTHORIZED',
  Success = 'SUCCESS',
}

export class WsAuthResponse {
  status: WsAuthStatus;
}
