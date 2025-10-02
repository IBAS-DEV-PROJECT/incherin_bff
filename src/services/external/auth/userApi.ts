// 사용자 API 서비스
// 백엔드 사용자 관리 API 호출 (향후 구현 예정)

import { User } from '../../../shared/types/user';
import { ApiResponse } from '../../../shared/types/api';

export interface UpdateUserRequest {
  name?: string;
  picture?: string;
}

export class UserApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
  }

  /**
   * 사용자 생성
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async createUser(userData: User): Promise<ApiResponse<User>> {
    // TODO: POST /api/users 호출
    // 현재는 더미 데이터 반환

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      provider: userData.provider,
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
   * 사용자 정보 업데이트
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    // TODO: PUT /api/users/:id 호출
    // 현재는 더미 데이터 반환

    const user: User = {
      id: userId,
      email: `${userId}@example.com`, // 더미 이메일
      name: userData.name || 'Updated User',
      picture: userData.picture,
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
   * 사용자 정보 조회
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    // TODO: GET /api/users/:id 호출
    // 현재는 더미 데이터 반환

    const user: User = {
      id: userId,
      email: `${userId}@example.com`, // 더미 이메일
      name: `User ${userId}`,
      picture: 'https://example.com/default-profile.png',
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
   * 내 정보 조회 (현재 로그인한 사용자)
   * GET /users/me
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async getMyProfile(userId: string): Promise<ApiResponse<User>> {
    // TODO: GET /users/me 호출
    // 현재는 더미 데이터 반환

    const user: User = {
      id: userId,
      email: `${userId}@example.com`,
      name: `My Profile ${userId}`,
      picture: 'https://example.com/my-profile.png',
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
   * 내 정보 수정 (현재 로그인한 사용자)
   * PATCH /users/me
   * TODO: 백엔드 API 명세서 나오면 구현
   */
  async updateMyProfile(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    // TODO: PATCH /users/me 호출
    // 현재는 더미 데이터 반환

    const user: User = {
      id: userId,
      email: `${userId}@example.com`,
      name: userData.name || `Updated User ${userId}`,
      picture: userData.picture || 'https://example.com/updated-profile.png',
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
}

export const userApiService = new UserApiService();
