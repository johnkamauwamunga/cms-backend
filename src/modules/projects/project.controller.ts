import type { Request, Response, NextFunction } from 'express';

import { projectService } from './project.service';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectQuerySchema,
  projectIdParamSchema,
  projectImageParamSchema,
  addProjectImageSchema,
  updateProjectImageSchema,
  reorderSchema,
} from './project.validation';
import { ValidationError } from '../../errors/validation.error';

export const projectController = {
  // ---------- public ----------

  async listPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listProjectQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await projectService.listPublic(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = projectIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid project id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await projectService.getPublicById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async getPublicBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug) throw new ValidationError('Missing slug');
      const item = await projectService.getPublicBySlug(slug);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  // ---------- admin: projects ----------

  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = listProjectQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const result = await projectService.listAdmin(parsed.data);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      next(err);
    }
  },

  async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = projectIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid project id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await projectService.getAdminById(parsed.data.id);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid project payload', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      const item = await projectService.create(parsed.data);
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = updateProjectSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid project payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const item = await projectService.update(params.data.id, body.data);
      res.status(200).json({ status: 'success', data: item });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = projectIdParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw new ValidationError('Invalid project id', {
          issues: parsed.error.flatten().fieldErrors,
        });
      }
      await projectService.remove(parsed.data.id);
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
      await projectService.reorder(parsed.data.ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  // ---------- admin: images ----------

  async addImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = addProjectImageSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid image payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const image = await projectService.addImage(params.data.id, body.data);
      res.status(201).json({ status: 'success', data: image });
    } catch (err) {
      next(err);
    }
  },

  async updateImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = projectImageParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid params', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = updateProjectImageSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid image payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      const image = await projectService.updateImage(
        params.data.projectId,
        params.data.imageId,
        body.data,
      );
      res.status(200).json({ status: 'success', data: image });
    } catch (err) {
      next(err);
    }
  },

  async removeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = projectImageParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid params', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      await projectService.removeImage(params.data.projectId, params.data.imageId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async reorderImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project id', {
          issues: params.error.flatten().fieldErrors,
        });
      }
      const body = reorderSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Invalid reorder payload', {
          issues: body.error.flatten().fieldErrors,
        });
      }
      await projectService.reorderImages(params.data.id, body.data.ids);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};