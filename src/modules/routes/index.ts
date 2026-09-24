import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';

export const router = Router();

router.use('/auth', authRouter);
// router.use('/profile', profileRouter);
// router.use('/projects', projectRouter);
// ... etc