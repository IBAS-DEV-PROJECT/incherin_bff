// Auth 라우터
// 인증 관련 API 엔드포인트 정의

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuthMiddleware, optionalAuthMiddleware } from '../../middleware/auth';

const router = Router();

// Google OAuth 시작
router.get('/google', AuthController.startOAuth);

// Google OAuth 콜백
router.get('/callback', AuthController.handleOAuthCallback);

// 현재 사용자 정보 조회 (인증 필수)
router.get('/me', requireAuthMiddleware as any, AuthController.getCurrentUser as any);

// 로그아웃 (인증 필수)
router.post('/logout', requireAuthMiddleware as any, AuthController.logout as any);

// 인증 상태 확인 (선택적 인증)
router.get('/status', optionalAuthMiddleware as any, AuthController.checkAuthStatus as any);

// 세션 갱신 (인증 필수)
router.post('/refresh', requireAuthMiddleware as any, AuthController.refreshSession as any);

export { router as authRoutes };
