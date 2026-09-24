import type { Request, Response, NextFunction } from 'express';

import { profileService } from './profile.service';
import { updateProfileSchema, userIdParamSchema } from './profile.validation';
import { ValidationError } from '../../errors/validation.error';
import { AuthenticationError } from '../../errors/authentication.error';

function requireUserId(req: Request): string {
  // authMiddleware guarantees this, but TS doesn't know that.
  if (!req.user?.sub) throw new AuthenticationError('Not authenticated');
  return req.user.sub;
}

export const profileController = {
  /** GET /api/profile/me */
  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const profile = await profileService.getOrCreateMine(userId);
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  },

  /** PATCH /api/profile/me */
  async updateMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid profile payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      const profile = await profileService.update(userId, parsed.data);
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  },

  /** POST /api/profile/me/publish   and   POST /api/profile/me/unpublish */
  async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const profile = await profileService.setPublished(userId, true);
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  },

  async unpublish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const profile = await profileService.setPublished(userId, false);
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  },

  /** DELETE /api/profile/me */
  async removeMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      await profileService.remove(userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/profile/:userId  (public) */
  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = userIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid user id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const profile = await profileService.getPublic(parsed.data.userId);
      res.status(200).json({ status: 'success', data: profile });
    } catch (err) {
      next(err);
    }
  },

  /** GET /api/profile  (public listing) */
  async listPublic(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profiles = await profileService.listPublished();
      res.status(200).json({ status: 'success', data: profiles });
    } catch (err) {
      next(err);
    }
  },
};