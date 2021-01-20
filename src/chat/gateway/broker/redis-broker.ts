import {
  BrokerMessage,
  BrokerMessageListener,
  MessageBrokerProvider,
} from '../interfaces/broker';
import * as redis from 'redis';
import { Inject } from '@nestjs/common';
import {
  ChatConfig,
  ChatConfigProvider,
} from '../../../app/config/namespace/chat.config';
import { promisify } from 'util';
import { ChatGatewayConfigException } from '../chat.gateway.exception';

// https://goldfirestudios.com/horizontally-scaling-node-js-and-websockets-with-redis
// https://tsh.io/blog/how-to-scale-websocket/

enum Channel {
  Chat = 'chat',
}

type RedisBrokerMessage = BrokerMessage & { clientId: string };

export class RedisBroker implements MessageBrokerProvider {
  // MARK: - Public Properties
  readonly clientId: string;
  onMessage: BrokerMessageListener | undefined = undefined;

  // MARK: - Private Properties
  private readonly publisher: redis.RedisClient;
  private readonly subscriber: redis.RedisClient;

  // MARK: - Initialization
  constructor(
    @Inject(ChatConfig.KEY)
    { redis: { clientId, host, port } }: ChatConfigProvider,
  ) {
    if (!clientId) {
      throw new Error(ChatGatewayConfigException.NoRedisClientId);
    }

    this.clientId = clientId;

    const options: redis.ClientOpts = {
      host,
      port,
    };

    this.publisher = redis.createClient(options);
    this.subscriber = redis.createClient(options);

    this.subscriber.on('message', (channel, message) => {
      if (channel !== Channel.Chat) {
        return;
      }

      const parsedMessage = JSON.parse(message) as RedisBrokerMessage;

      if (parsedMessage.clientId === this.clientId) {
        return;
      }

      this.onMessage && this.onMessage(parsedMessage);
    });

    this.subscriber.subscribe(Channel.Chat);
  }

  // MARk: - Public Methods
  async publishMessage(message: BrokerMessage): Promise<void> {
    const publish = promisify(this.publisher.publish).bind(this.publisher);

    const redisMessage: RedisBrokerMessage = {
      ...message,
      clientId: this.clientId,
    };

    await publish(Channel.Chat, JSON.stringify(redisMessage));
  }
}
