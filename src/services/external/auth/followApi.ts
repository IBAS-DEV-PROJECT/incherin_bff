// 팔로우 API 서비스
// 사용자 간 팔로우 관계 관리 API 호출 (향후 구현 예정)

import { User } from '../../../shared/types/user';
import { ApiResponse } from '../../../shared/types/api';

export interface FollowUserRequest {
  targetUserId: string;
}

export interface FollowResponse {
  success: boolean;
  message: string;
}

export interface FollowersResponse {
  followers: User[];
  total: number;
}

export interface FollowingResponse {
  following: User[];
  total: number;
}

export class FollowApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
  }

  /**
   * 다른 유저 정보 조회
   * GET /profiles/{userId}
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    // TODO: GET /profiles/{userId} 호출
    // 현재는 더미 데이터 반환

    const user: User = {
      id: userId,
      email: `${userId}@example.com`,
      name: `Profile User ${userId}`,
      picture: 'https://example.com/profile.png',
      provider: 'google',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: user,
    };
  }

  /**
   * 사용자 팔로우
   * POST /users/{targetUserId}/follow
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async followUser(userId: string, targetUserId: string): Promise<ApiResponse<FollowResponse>> {
    // TODO: POST /users/{targetUserId}/follow 호출
    // 현재는 더미 데이터 반환

    const response: FollowResponse = {
      success: true,
      message: `Successfully followed user ${targetUserId}`,
    };

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: response,
    };
  }

  /**
   * 사용자 언팔로우
   * DELETE /users/{targetUserId}/follow
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async unfollowUser(userId: string, targetUserId: string): Promise<ApiResponse<FollowResponse>> {
    // TODO: DELETE /users/{targetUserId}/follow 호출
    // 현재는 더미 데이터 반환

    const response: FollowResponse = {
      success: true,
      message: `Successfully unfollowed user ${targetUserId}`,
    };

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: response,
    };
  }

  /**
   * 팔로워 조회
   * GET /followers/{userId}
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async getFollowers(userId: string): Promise<ApiResponse<FollowersResponse>> {
    // TODO: GET /followers/{userId} 호출
    // 현재는 더미 데이터 반환

    const followers: User[] = [
      {
        id: 'follower1',
        email: 'follower1@example.com',
        name: 'Follower 1',
        picture: 'https://example.com/follower1.png',
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'follower2',
        email: 'follower2@example.com',
        name: 'Follower 2',
        picture: 'https://example.com/follower2.png',
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const response: FollowersResponse = {
      followers,
      total: followers.length,
    };

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: response,
    };
  }

  /**
   * 팔로잉 조회
   * GET /following/{userId}
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async getFollowing(userId: string): Promise<ApiResponse<FollowingResponse>> {
    // TODO: GET /following/{userId} 호출
    // 현재는 더미 데이터 반환

    const following: User[] = [
      {
        id: 'following1',
        email: 'following1@example.com',
        name: 'Following 1',
        picture: 'https://example.com/following1.png',
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'following2',
        email: 'following2@example.com',
        name: 'Following 2',
        picture: 'https://example.com/following2.png',
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const response: FollowingResponse = {
      following,
      total: following.length,
    };

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: response,
    };
  }
}

export const followApiService = new FollowApiService();
