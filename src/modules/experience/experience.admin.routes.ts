import { Router } from 'express';
import { experienceController } from './experience.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const experienceAdminRouter = Router();

experienceAdminRouter.use(authMiddleware, requireRole('ADMIN'));

experienceAdminRouter.get('/', experienceController.listAdmin);
experienceAdminRouter.get('/:id', experienceController.getAdmin);
experienceAdminRouter.post('/', experienceController.create);
experienceAdminRouter.patch('/:id', experienceController.update);
experienceAdminRouter.delete('/:id', experienceController.remove);
experienceAdminRouter.post('/reorder', experienceController.reorder);