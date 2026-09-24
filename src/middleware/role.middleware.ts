import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@prisma/client';

import { AuthenticationError } from '../errors/authentication.error';
import { AuthorizationError } from '../errors/authorization.error';

/**
 * Usage:
 *   router.post('/', authMiddleware, requireRole('ADMIN'), handler)
 *
 * Must run AFTER authMiddleware — req.user must already be set.
 * Accepts one or more roles; passes if the user has ANY of them.
 */
export function requireRole(...allowed: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Not authenticated'));
    }

    if (allowed.length > 0 && !allowed.includes(req.user.role as UserRole)) {
      return next(
        new AuthorizationError(
          `Requires one of: ${allowed.join(', ')}`,
        ),
      );
    }

    next();
  };
}