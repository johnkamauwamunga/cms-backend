import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { AuthenticationError } from '../errors/authentication.error';

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Access denied. No token provided.'));
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(new AuthenticationError('Access denied. Empty token.'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    next(new AuthenticationError('Invalid or expired token.'));
  }
};