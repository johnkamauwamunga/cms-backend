import { Router } from 'express';
import { projectController } from './project.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

export const projectAdminRouter = Router();

projectAdminRouter.use(authMiddleware, requireRole('ADMIN'));

// Projects
projectAdminRouter.get('/', projectController.listAdmin);
projectAdminRouter.get('/:id', projectController.getAdmin);
projectAdminRouter.post('/', projectController.create);
projectAdminRouter.patch('/:id', projectController.update);
projectAdminRouter.delete('/:id', projectController.remove);
projectAdminRouter.post('/reorder', projectController.reorder);

// Images (nested under a project)
projectAdminRouter.post('/:id/images', projectController.addImage);
projectAdminRouter.patch('/:projectId/images/:imageId', projectController.updateImage);
projectAdminRouter.delete('/:projectId/images/:imageId', projectController.removeImage);
projectAdminRouter.post('/:id/images/reorder', projectController.reorderImages);