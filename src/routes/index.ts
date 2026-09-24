import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { uploadRouter } from '../modules/uploads/upload.routes';
import { profileRouter } from '../modules/profile/profile.routes';
import { interestRouter } from '../modules/interests/interest.routes';
import { interestAdminRouter } from '../modules/interests/interest.admin.routes';
import { experienceRouter } from '../modules/experience/experience.routes';
import { experienceAdminRouter } from '../modules/experience/experience.admin.routes';
import { educationRouter } from '../modules/education/education.routes';
import { educationAdminRouter } from '../modules/education/education.admin.routes';
import { certificationRouter } from '../modules/certifications/certification.routes';
import { certificationAdminRouter } from '../modules/certifications/certification.admin.routes';
import { projectRouter } from '../modules/projects/project.routes';
import { projectAdminRouter } from '../modules/projects/project.admin.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/uploads', uploadRouter);
router.use('/profile', profileRouter);

router.use('/interests', interestRouter);
router.use('/experience', experienceRouter);
router.use('/education', educationRouter);
router.use('/certifications', certificationRouter);
router.use('/projects', projectRouter);

router.use('/admin/interests', interestAdminRouter);
router.use('/admin/experience', experienceAdminRouter);
router.use('/admin/education', educationAdminRouter);
router.use('/admin/certifications', certificationAdminRouter);
router.use('/admin/projects', projectAdminRouter);