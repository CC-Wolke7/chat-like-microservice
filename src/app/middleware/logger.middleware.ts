// import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// @Injectable()
// export class LoggerMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction): void {
//     console.log(`${req.method} ${req.path}`);
//     next();
//   }
// }

export function logger(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  console.log(`${request.method} ${request.path}`, request.query);
  next();
}
