import type { Request, Response, NextFunction } from 'express';

import { authService } from './auth.service';
import { refreshSchema, registerSchema, loginSchema } from './auth.validation';
import { ValidationError } from '../../errors/validation.error';
import { AuthenticationError } from '../../errors/authentication.error';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid registration payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await authService.register(parsed.data);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid login payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await authService.login(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid refresh payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      const tokens = await authService.refresh(parsed.data);
      res.status(200).json({ status: 'success', data: tokens });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid logout payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      await authService.logout(parsed.data.refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError('Not authenticated');
      }
      const user = await authService.me(req.user.sub);
      res.status(200).json({ status: 'success', data: user });
    } catch (err) {
      next(err);
    }
  },
};