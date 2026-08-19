import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class CorrelationIdMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use = (request: Request, response: Response, next: NextFunction): void => {
    const correlationId = request.header('X-Correlation-Id') ?? randomUUID();

    response.setHeader('X-Correlation-Id', correlationId);
    response.on('finish', () => {
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} ${correlationId}`,
      );
    });

    next();
  };
}
