import { Router } from 'express';
import { uploadController } from './upload.controller';
import { uploadSingle } from './upload.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
// import { requireRole } from '../../middleware/role.middleware'; // when ready

export const uploadRouter = Router();

uploadRouter.use(authMiddleware);

uploadRouter.post(
  '/',
  uploadSingle('file'),
  uploadController.uploadOne,
);

uploadRouter.get('/:id', uploadController.getOne);

uploadRouter.delete(
  '/:id',
  // requireRole('ADMIN'),  // enable when role middleware exists
  uploadController.deleteOne,
);