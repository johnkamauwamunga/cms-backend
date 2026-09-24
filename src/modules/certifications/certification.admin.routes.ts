import { Router } from 'express';
import { certificationController } from './certification.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const certificationAdminRouter = Router();

certificationAdminRouter.use(authMiddleware, requireRole('ADMIN'));

certificationAdminRouter.get('/', certificationController.listAdmin);
certificationAdminRouter.get('/:id', certificationController.getAdmin);
certificationAdminRouter.post('/', certificationController.create);
certificationAdminRouter.patch('/:id', certificationController.update);
certificationAdminRouter.delete('/:id', certificationController.remove);
certificationAdminRouter.post('/reorder', certificationController.reorder);