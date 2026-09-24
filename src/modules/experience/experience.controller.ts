import type { Request, Response, NextFunction } from 'express';

import { experienceService } from './experience.service';
import {
  createExperienceSchema,
  updateExperienceSchema,
  listExperienceQuerySchema,
  experienceIdParamSchema,
  reorderSchema,
} from './experience.validation';
import { ValidationError } from '../../errors/validation.error';

export const experienceController = {
  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listExperienceQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await experienceService.listPublic(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = experienceIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid experience id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await experienceService.getPublicById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listExperienceQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await experienceService.listAdmin(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = experienceIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid experience id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await experienceService.getAdminById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createExperienceSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid experience payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await experienceService.create(parsed.data);
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = experienceIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid experience id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = updateExperienceSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid experience payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const item = await experienceService.update(params.data.id, body.data);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = experienceIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid experience id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await experienceService.remove(parsed.data.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = reorderSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid reorder payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await experienceService.reorder(parsed.data.ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};