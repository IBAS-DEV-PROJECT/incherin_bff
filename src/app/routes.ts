import { Router } from 'express';
import { systemRoutes } from '../modules/system';
import { authRoutes } from '../modules/auth';
import { userRoutes } from '../modules/user';

const router = Router();

// 시스템 관련 API
router.use('/', systemRoutes);

// 인증 관련 API
router.use('/auth', authRoutes);

// 사용자 관련 API
router.use('/user', userRoutes);

export default router;
