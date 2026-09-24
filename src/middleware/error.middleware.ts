import jwt from 'jsonwebtoken';           // default import — always works
import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

import { AppError } from '../errors/app-error';
import { ValidationError } from '../errors/validation.error';
import { AuthenticationError } from '../errors/authentication.error';
import { ConflictError } from '../errors/conflict.error';
import { logger } from '../lib/logger';

// Pull the classes off the default export at runtime.
const { TokenExpiredError, JsonWebTokenError } = jwt;

function normalizeError(error: unknown): AppError | null {
  if (error instanceof AppError) return error;

  if (error instanceof TokenExpiredError) {
    return new AuthenticationError('Token expired');
  }
  if (error instanceof JsonWebTokenError) {
    return new AuthenticationError('Invalid token');
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new ConflictError('A record with these values already exists');
    }
    if (error.code === 'P2025') {
      return new AppError('Resource not found', 404, true, 'NOT_FOUND');
    }
  }

  return null;
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const appError = normalizeError(error);

  if (appError) {
    logger.error(
      {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: appError.statusCode,
        errorCode: appError.errorCode,
        errorName: appError.name,
        err: appError,
      },
      'Application error',
    );

    res.status(appError.statusCode).json({
      status: 'error',
      code: appError.errorCode,
      message: appError.message,
      ...(appError instanceof ValidationError && { details: appError.details }),
    });

    return;
  }

  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      err: error,
    },
    'Unexpected server error',
  );

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
};