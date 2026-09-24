import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    logger.info(
      {
        requestId: req.requestId,
        method: req.method,
        status: res.statusCode,
        path: req.originalUrl,
        duration: Date.now() - startTime,
      },
      'HTTP request',
    );
  });

  next();
};