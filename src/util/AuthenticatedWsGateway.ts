import * as WebSocket from 'ws';
import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import * as http from 'http';
import * as net from 'net';
import { HttpAdapterHost } from '@nestjs/core';

// alternative: https://github.com/nestjs/nest/issues/882#issuecomment-631643591
export abstract class AuthenticatedWsGateway<T>
  implements OnGatewayInit<WebSocket.Server>, OnGatewayConnection {
  // MARK: - Private Properties
  private readonly adapterHost: HttpAdapterHost;

  // MARK: - Initialization
  constructor(adapterHost: HttpAdapterHost) {
    this.adapterHost = adapterHost;
  }

  // MARK: - Public Methods
  abstract verifyUser(request: http.IncomingMessage): Promise<T | undefined>;

  // MARK: Lifecycle
  afterInit(server: WebSocket.Server): void {
    // https://github.com/nestjs/nest/issues/882#issuecomment-756444447
    const httpAdapter = this.adapterHost.httpAdapter;
    const httpServer = httpAdapter.getHttpServer() as net.Server;
    // const httpServer = (server as any)._server as net.Server;

    httpServer.removeAllListeners('upgrade');

    // https://github.com/websockets/ws/issues/377#issuecomment-462152231
    httpServer.on(
      'upgrade',
      async (
        request: http.IncomingMessage,
        socket: net.Socket,
        head: Buffer,
      ) => {
        try {
          const user = await this.verifyUser(request);

          if (!user) {
            return this.abortHandshake(socket, 401);
          }

          server.handleUpgrade(request, socket, head, (websocket) => {
            server.emit('connection', websocket, request, user);
          });
        } catch {
          this.abortHandshake(socket, 401);
        }
      },
    );
  }

  abstract handleConnection(
    socket: WebSocket,
    request: http.IncomingMessage,
    user: T,
  ): void;

  // MARK: - Private Methods
  // https://github.com/websockets/ws/blob/master/lib/websocket-server.js#L384
  private abortHandshake(
    socket: net.Socket,
    code: number,
    message?: string,
  ): void {
    if (socket.writable) {
      message = message || (http.STATUS_CODES[code] as string);

      const headers = {
        Connection: 'close',
        'Content-Type': 'text/html',
        'Content-Length': Buffer.byteLength(message!),
      };

      socket.write(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
          Object.keys(headers)
            .map((h) => `${h}: ${headers[h]}`)
            .join('\r\n') +
          '\r\n\r\n' +
          message,
      );
    }

    socket.destroy();
  }
}
