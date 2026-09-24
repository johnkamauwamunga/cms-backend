import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { uploadRouter } from '../modules/uploads/upload.routes';
import { profileRouter } from '../modules/profile/profile.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/uploads', uploadRouter);
router.use('/profile', profileRouter);