import { Router } from 'express';
import { systemRoutes } from '../modules/system';
import { authRoutes } from '../modules/auth';

const router = Router();

// 시스템 관련 API
router.use('/', systemRoutes);

// 인증 관련 API
router.use('/auth', authRoutes);

export default router;
