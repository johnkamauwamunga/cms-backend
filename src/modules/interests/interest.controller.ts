import type { Request, Response, NextFunction } from 'express';

import { interestService } from './interest.service';
import {
  createInterestSchema,
  updateInterestSchema,
  listInterestsQuerySchema,
  interestIdParamSchema,
} from './interest.validation';
import { ValidationError } from '../../errors/validation.error';

export const interestController = {
  // ---------- Public ----------

  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listInterestsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await interestService.listPublic(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = interestIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid interest id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await interestService.getPublicById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  // ---------- Admin ----------

  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listInterestsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await interestService.listAdmin(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = interestIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid interest id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await interestService.getAdminById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createInterestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid interest payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await interestService.create(parsed.data);
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = interestIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid interest id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = updateInterestSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid interest payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const item = await interestService.update(params.data.id, body.data);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = interestIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid interest id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await interestService.remove(parsed.data.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = createReorderSchemaSafe();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid reorder payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await interestService.reorder(parsed.data.ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

// local import to avoid widening the top-level import list
import { z } from 'zod';
function createReorderSchemaSafe() {
  return z.object({
    ids: z.array(z.string().uuid()).min(1).max(500),
  }).strict();
}