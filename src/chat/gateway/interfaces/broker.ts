import { WsResponse } from '@nestjs/websockets';
import { UserUUID } from '../../interfaces/storage';

// MARK: - Model
export interface BrokerMessage {
  users: UserUUID[];
  payload: WsResponse;
}

export type BrokerMessageListener = (message: BrokerMessage) => void;

// MARK: - Provider
export interface MessageBrokerProvider {
  onMessage?: BrokerMessageListener;
  publishMessage(message: BrokerMessage): Promise<void>;
}
