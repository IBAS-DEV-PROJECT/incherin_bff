// User 컨트롤러
// 사용자 정보 및 팔로우 관계 HTTP 요청 처리

import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/types/user';
import { userService } from './user.service';
import { sendInternalError, sendBadRequest, sendUnauthorized, sendOk } from '../../shared/response';

export class UserController {
  /**
   * 내 정보 조회
   * GET /user/me
   */
  static async getMyProfile(req: AuthRequest, res: Response) {
    try {
      const token =
        req.cookies?.authToken ||
        (req.headers['authorization']?.split(' ')[1] as string) ||
        (req.headers['x-auth-token'] as string);

      if (!token) {
        return sendUnauthorized(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      const result = await userService.getMyProfile(token);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to get my profile',
          result.error?.code || 'GET_PROFILE_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Get my profile error:', error);
      return sendInternalError(res, 'Failed to get my profile', 'GET_PROFILE_ERROR');
    }
  }

  /**
   * 내 정보 수정
   * PATCH /user/me
   */
  static async updateMyProfile(req: AuthRequest, res: Response) {
    try {
      const token =
        req.cookies?.authToken ||
        (req.headers['authorization']?.split(' ')[1] as string) ||
        (req.headers['x-auth-token'] as string);
      const { name, picture } = req.body;

      if (!token) {
        return sendUnauthorized(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      const result = await userService.updateMyProfile(token, { name, picture });

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to update profile',
          result.error?.code || 'PROFILE_UPDATE_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Update profile error:', error);
      return sendInternalError(res, 'Failed to update profile', 'PROFILE_UPDATE_ERROR');
    }
  }

  /**
   * 다른 유저 정보 조회
   * GET /user/profiles/{userId}
   */
  static async getUserProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendBadRequest(res, 'User ID is required', 'MISSING_USER_ID');
      }

      const result = await userService.getUserProfile(userId);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to get user profile',
          result.error?.code || 'GET_PROFILE_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Get user profile error:', error);
      return sendInternalError(res, 'Failed to get user profile', 'GET_PROFILE_ERROR');
    }
  }

  /**
   * 사용자 팔로우
   * POST /user/follow/{targetUserId}
   */
  static async followUser(req: AuthRequest, res: Response) {
    try {
      const { targetUserId } = req.params;
      const token =
        req.cookies?.authToken ||
        (req.headers['authorization']?.split(' ')[1] as string) ||
        (req.headers['x-auth-token'] as string);

      if (!targetUserId) {
        return sendBadRequest(res, 'Target user ID is required', 'MISSING_TARGET_USER_ID');
      }

      if (!token) {
        return sendUnauthorized(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      const result = await userService.followUser(token, targetUserId);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to follow user',
          result.error?.code || 'FOLLOW_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Follow user error:', error);
      return sendInternalError(res, 'Failed to follow user', 'FOLLOW_ERROR');
    }
  }

  /**
   * 사용자 언팔로우
   * DELETE /user/follow/{targetUserId}
   */
  static async unfollowUser(req: AuthRequest, res: Response) {
    try {
      const { targetUserId } = req.params;
      const token =
        req.cookies?.authToken ||
        (req.headers['authorization']?.split(' ')[1] as string) ||
        (req.headers['x-auth-token'] as string);

      if (!targetUserId) {
        return sendBadRequest(res, 'Target user ID is required', 'MISSING_TARGET_USER_ID');
      }

      if (!token) {
        return sendUnauthorized(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      const result = await userService.unfollowUser(token, targetUserId);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to unfollow user',
          result.error?.code || 'UNFOLLOW_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Unfollow user error:', error);
      return sendInternalError(res, 'Failed to unfollow user', 'UNFOLLOW_ERROR');
    }
  }

  /**
   * 팔로워 조회
   * GET /user/followers/{userId}
   */
  static async getFollowers(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendBadRequest(res, 'User ID is required', 'MISSING_USER_ID');
      }

      const result = await userService.getFollowers(userId);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to get followers',
          result.error?.code || 'GET_FOLLOWERS_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Get followers error:', error);
      return sendInternalError(res, 'Failed to get followers', 'GET_FOLLOWERS_ERROR');
    }
  }

  /**
   * 팔로잉 조회
   * GET /user/following/{userId}
   */
  static async getFollowing(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendBadRequest(res, 'User ID is required', 'MISSING_USER_ID');
      }

      const result = await userService.getFollowing(userId);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to get following',
          result.error?.code || 'GET_FOLLOWING_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Get following error:', error);
      return sendInternalError(res, 'Failed to get following', 'GET_FOLLOWING_ERROR');
    }
  }
}
