// User 서비스 로직
// 사용자 정보 관리 및 팔로우 관계 처리

import { userApiService, followApiService } from '../../services/external/auth';
import { jwtService } from '../../services/internal/jwtService';
import { User } from '../../shared/types/user';
import {
  UserProfileResponse,
  FollowResponse,
  FollowersResponse,
  FollowingResponse,
  UpdateUserRequest,
} from './user.types';

export class UserService {
  /**
   * 내 정보 조회 (JWT 토큰에서 추출 + 백엔드에서 최신 정보 조회)
   */
  async getMyProfile(token: string): Promise<UserProfileResponse> {
    try {
      // JWT 토큰에서 사용자 정보 추출
      const jwtUser = jwtService.extractUser(token);

      if (!jwtUser) {
        return {
          success: false,
          statusCode: 401,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
          },
        };
      }

      // 백엔드에서 최신 사용자 정보 조회
      const profileResponse = await userApiService.getMyProfile(jwtUser.id);

      if (profileResponse.success && profileResponse.data) {
        // 백엔드에서 최신 정보 반환
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          user: profileResponse.data,
        };
      }

      // 백엔드 조회 실패시 JWT 정보 반환
      console.warn('Backend profile fetch failed, using JWT data');
      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        user: jwtUser,
      };
    } catch (error) {
      console.error('Get my profile error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get my profile',
          code: 'GET_PROFILE_FAILED',
        },
      };
    }
  }

  /**
   * 내 정보 수정 (백엔드 API 호출)
   */
  async updateMyProfile(token: string, userData: UpdateUserRequest): Promise<UserProfileResponse> {
    try {
      // JWT 토큰에서 사용자 정보 추출
      const jwtUser = jwtService.extractUser(token);

      if (!jwtUser) {
        return {
          success: false,
          statusCode: 401,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
          },
        };
      }

      // 백엔드에서 사용자 정보 수정
      const updateResponse = await userApiService.updateMyProfile(jwtUser.id, userData);

      if (updateResponse.success && updateResponse.data) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          user: updateResponse.data,
        };
      }

      return {
        success: false,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to update profile',
          code: 'PROFILE_UPDATE_FAILED',
        },
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to update profile',
          code: 'PROFILE_UPDATE_ERROR',
        },
      };
    }
  }

  /**
   * 다른 유저 정보 조회
   */
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      const profileResponse = await followApiService.getUserProfile(userId);

      if (profileResponse.success && profileResponse.data) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          user: profileResponse.data,
        };
      }

      return {
        success: false,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get user profile',
          code: 'GET_PROFILE_FAILED',
        },
      };
    }
  }

  /**
   * 사용자 팔로우
   */
  async followUser(token: string, targetUserId: string): Promise<FollowResponse> {
    try {
      const jwtUser = jwtService.extractUser(token);

      if (!jwtUser) {
        return {
          success: false,
          statusCode: 401,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
          },
        };
      }

      const followResponse = await followApiService.followUser(jwtUser.id, targetUserId);

      if (followResponse.success && followResponse.data) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          message: followResponse.data.message,
        };
      }

      return {
        success: false,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to follow user',
          code: 'FOLLOW_FAILED',
        },
      };
    } catch (error) {
      console.error('Follow user error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to follow user',
          code: 'FOLLOW_ERROR',
        },
      };
    }
  }

  /**
   * 사용자 언팔로우
   */
  async unfollowUser(token: string, targetUserId: string): Promise<FollowResponse> {
    try {
      const jwtUser = jwtService.extractUser(token);

      if (!jwtUser) {
        return {
          success: false,
          statusCode: 401,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN',
          },
        };
      }

      const unfollowResponse = await followApiService.unfollowUser(jwtUser.id, targetUserId);

      if (unfollowResponse.success && unfollowResponse.data) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          message: unfollowResponse.data.message,
        };
      }

      return {
        success: false,
        statusCode: 400,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to unfollow user',
          code: 'UNFOLLOW_FAILED',
        },
      };
    } catch (error) {
      console.error('Unfollow user error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to unfollow user',
          code: 'UNFOLLOW_ERROR',
        },
      };
    }
  }

  /**
   * 팔로워 조회
   */
  async getFollowers(userId: string): Promise<FollowersResponse> {
    try {
      const followersResponse = await followApiService.getFollowers(userId);

      if (followersResponse.success && followersResponse.data) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          followers: followersResponse.data.followers,
          total: followersResponse.data.total,
        };
      }

      return {
        success: false,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get followers',
          code: 'GET_FOLLOWERS_FAILED',
        },
      };
    } catch (error) {
      console.error('Get followers error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get followers',
          code: 'GET_FOLLOWERS_ERROR',
        },
      };
    }
  }

  /**
   * 팔로잉 조회
   */
  async getFollowing(userId: string): Promise<FollowingResponse> {
    try {
      const followingResponse = await followApiService.getFollowing(userId);

      if (followingResponse.success && followingResponse.data) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          following: followingResponse.data.following,
          total: followingResponse.data.total,
        };
      }

      return {
        success: false,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get following',
          code: 'GET_FOLLOWING_FAILED',
        },
      };
    } catch (error) {
      console.error('Get following error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get following',
          code: 'GET_FOLLOWING_ERROR',
        },
      };
    }
  }
}

export const userService = new UserService();
