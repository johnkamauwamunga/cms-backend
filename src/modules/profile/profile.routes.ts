import { Router } from 'express';
import { profileController } from './profile.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const profileRouter = Router();

// ---- Public (no auth) ----
profileRouter.get('/', profileController.listPublic);

// ---- Authed "me" routes — MUST come before /:userId ----
profileRouter.get('/me', authMiddleware, profileController.getMine);
profileRouter.patch('/me', authMiddleware, profileController.updateMine);
profileRouter.delete('/me', authMiddleware, profileController.removeMine);
profileRouter.post('/me/publish', authMiddleware, profileController.publish);
profileRouter.post('/me/unpublish', authMiddleware, profileController.unpublish);

// ---- Public profile by userId ----
profileRouter.get('/:userId', profileController.getPublic);