import { Router } from 'express';
import { educationController } from './education.controller';

export const educationRouter = Router();

educationRouter.get('/', educationController.listPublic);
educationRouter.get('/:id', educationController.getPublic);