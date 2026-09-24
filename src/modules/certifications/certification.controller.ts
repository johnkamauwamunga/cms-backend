import type { Request, Response, NextFunction } from 'express';

import { certificationService } from './certification.service';
import {
  createCertificationSchema,
  updateCertificationSchema,
  listCertificationQuerySchema,
  certificationIdParamSchema,
  reorderSchema,
} from './certification.validation';
import { ValidationError } from '../../errors/validation.error';

export const certificationController = {
  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listCertificationQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await certificationService.listPublic(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = certificationIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid certification id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await certificationService.getPublicById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listCertificationQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await certificationService.listAdmin(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = certificationIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid certification id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await certificationService.getAdminById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createCertificationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid certification payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await certificationService.create(parsed.data);
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = certificationIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid certification id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = updateCertificationSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid certification payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const item = await certificationService.update(params.data.id, body.data);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = certificationIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid certification id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await certificationService.remove(parsed.data.id);
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
      await certificationService.reorder(parsed.data.ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};