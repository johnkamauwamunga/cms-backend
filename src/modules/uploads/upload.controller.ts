import type { Request, Response, NextFunction } from 'express';

import { uploadService } from './upload.service';
import { translateMulterError } from './upload.middleware';
import { ValidationError } from '../../errors/validation.error';

export const uploadController = {
  async uploadOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      const result = await uploadService.upload(file);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      next(translateMulterError(err));
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ValidationError('Missing file id');
      const file = await uploadService.getById(id);
      res.status(200).json({ status: 'success', data: file });
    } catch (err) {
      next(err);
    }
  },

  async deleteOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ValidationError('Missing file id');
      await uploadService.remove(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};