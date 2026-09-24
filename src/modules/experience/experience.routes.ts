import { Router } from 'express';
import { experienceController } from './experience.controller';

export const experienceRouter = Router();

// Public
experienceRouter.get('/', experienceController.listPublic);
experienceRouter.get('/:id', experienceController.getPublic);