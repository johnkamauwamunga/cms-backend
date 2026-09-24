import { Router } from 'express';
import { educationController } from './education.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const educationAdminRouter = Router();

educationAdminRouter.use(authMiddleware, requireRole('ADMIN'));

educationAdminRouter.get('/', educationController.listAdmin);
educationAdminRouter.get('/:id', educationController.getAdmin);
educationAdminRouter.post('/', educationController.create);
educationAdminRouter.patch('/:id', educationController.update);
educationAdminRouter.delete('/:id', educationController.remove);
educationAdminRouter.post('/reorder', educationController.reorder);