import { Router } from 'express';

import { interestController } from './interest.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const interestRouter = Router();

// ---------- Public ----------
interestRouter.get('/', interestController.listPublic);
interestRouter.get('/:id', interestController.getPublic);

// ---------- Admin ----------
// Writes all require ADMIN. Reads of unpublished items are admin-only too.
interestRouter.post(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  interestController.create,
);

interestRouter.patch(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  interestController.update,
);

interestRouter.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  interestController.remove,
);

interestRouter.post(
  '/reorder',
  authMiddleware,
  requireRole('ADMIN'),
  interestController.reorder,
);