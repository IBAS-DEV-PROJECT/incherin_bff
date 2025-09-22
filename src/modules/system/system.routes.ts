import { Router } from 'express';
import { SystemController } from './system.controller';

const router = Router();

// GET /healthz - 헬스체크
router.get('/healthz', SystemController.getHealth);

// GET /version - 버전 정보
router.get('/version', SystemController.getVersion);

export default router;
