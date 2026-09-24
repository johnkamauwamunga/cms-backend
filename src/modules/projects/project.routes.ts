import { Router } from 'express';
import { projectController } from './project.controller';

export const projectRouter = Router();

projectRouter.get('/', projectController.listPublic);
projectRouter.get('/slug/:slug', projectController.getPublicBySlug);
projectRouter.get('/:id', projectController.getPublic);