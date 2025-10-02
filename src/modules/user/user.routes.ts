// User 라우터
// 사용자 정보 및 팔로우 관계 API 엔드포인트 정의

import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuthMiddleware, optionalAuthMiddleware } from '../../middleware/auth';

const router = Router();

// 내 정보 조회 (인증 필수)
router.get('/me', requireAuthMiddleware as any, UserController.getMyProfile as any);

// 내 정보 수정 (인증 필수)
router.patch('/me', requireAuthMiddleware as any, UserController.updateMyProfile as any);

// 다른 유저 정보 조회 (인증 불필요)
router.get('/profiles/:userId', UserController.getUserProfile as any);

// 사용자 팔로우 (인증 필수)
router.post(
  '/follow/:targetUserId',
  requireAuthMiddleware as any,
  UserController.followUser as any
);

// 사용자 언팔로우 (인증 필수)
router.delete(
  '/follow/:targetUserId',
  requireAuthMiddleware as any,
  UserController.unfollowUser as any
);

// 팔로워 조회 (인증 불필요)
router.get('/followers/:userId', UserController.getFollowers as any);

// 팔로잉 조회 (인증 불필요)
router.get('/following/:userId', UserController.getFollowing as any);

export { router as userRoutes };
