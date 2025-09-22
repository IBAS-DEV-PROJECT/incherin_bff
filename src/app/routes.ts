import { Router } from 'express';
import { systemRoutes } from '../modules/system';

const router = Router();

// 시스템 관련 API
router.use('/', systemRoutes);

// 기존 테스트 API (나중에 제거 가능)
router.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from BFF!' });
});

export default router;
