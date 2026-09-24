import type { Request, Response, NextFunction } from 'express';

import { educationService } from './education.service';
import {
  createEducationSchema,
  updateEducationSchema,
  listEducationQuerySchema,
  educationIdParamSchema,
  reorderSchema,
} from './education.validation';
import { ValidationError } from '../../errors/validation.error';

export const educationController = {
  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listEducationQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await educationService.listPublic(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = educationIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid education id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await educationService.getPublicById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listEducationQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await educationService.listAdmin(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = educationIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid education id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await educationService.getAdminById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createEducationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid education payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await educationService.create(parsed.data);
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = educationIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid education id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = updateEducationSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid education payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const item = await educationService.update(params.data.id, body.data);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = educationIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid education id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await educationService.remove(parsed.data.id);
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
      await educationService.reorder(parsed.data.ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};