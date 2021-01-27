import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    // @TODO: use global logger - https://docs.nestjs.com/techniques/logger
    console.log(
      `${request.method} ${request.path}`,
      JSON.stringify(request.query, undefined, 4),
    );
    next();
  }
}
