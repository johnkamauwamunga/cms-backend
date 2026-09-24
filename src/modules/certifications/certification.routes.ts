import { Router } from 'express';
import { certificationController } from './certification.controller';

export const certificationRouter = Router();

certificationRouter.get('/', certificationController.listPublic);
certificationRouter.get('/:id', certificationController.getPublic);