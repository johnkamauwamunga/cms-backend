import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const incoming = req.headers['x-request-id'];
  const id = (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();

  req.requestId = id;
  res.setHeader('x-request-id', id);

  next();
};