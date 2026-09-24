import { Router } from 'express';
import { interestController } from './interest.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const interestAdminRouter = Router();

interestAdminRouter.use(authMiddleware, requireRole('ADMIN'));

interestAdminRouter.get('/', interestController.listAdmin);
interestAdminRouter.get('/:id', interestController.getAdmin);
interestAdminRouter.post('/', interestController.create);
interestAdminRouter.patch('/:id', interestController.update);
interestAdminRouter.delete('/:id', interestController.remove);
interestAdminRouter.post('/reorder', interestController.reorder);