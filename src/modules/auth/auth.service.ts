// Auth 서비스 로직
// Google OAuth 플로우 및 JWT 토큰 관리

import { GoogleApiService, userApiService } from '../../services/external/auth';
import { jwtService } from '../../services/internal/jwtService';
import { config } from '../../config/env';
import { User, GoogleUser } from '../../shared/types/user';
import { JwtPayload } from '../../services/internal/jwtService';
import {
  OAuthCallbackResponse,
  MeResponse,
  LogoutResponse,
  AuthStatusResponse,
  RefreshSessionResponse,
} from './auth.types';

export class AuthService {
  private googleApiService: GoogleApiService;

  constructor() {
    this.googleApiService = new GoogleApiService(
      config.google.clientId,
      config.google.clientSecret,
      config.google.callbackUrl
    );
  }

  /**
   * Google OAuth 인증 URL 생성
   */
  generateAuthUrl(state?: string): string {
    return this.googleApiService.generateAuthUrl(state);
  }

  /**
   * Google OAuth 콜백 처리
   */
  async handleOAuthCallback(code: string, state?: string): Promise<OAuthCallbackResponse> {
    try {
      // 1. 인증 코드를 액세스 토큰으로 교환
      const tokenResponse = await this.googleApiService.exchangeCodeForToken(code);

      if (!tokenResponse.success || !tokenResponse.data) {
        return {
          success: false,
          statusCode: 400,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Failed to exchange code for token',
            code: 'TOKEN_EXCHANGE_FAILED',
          },
        };
      }

      // 2. 액세스 토큰으로 사용자 정보 조회
      const userInfoResponse = await this.googleApiService.getUserInfo(
        tokenResponse.data.access_token
      );

      if (!userInfoResponse.success || !userInfoResponse.data) {
        return {
          success: false,
          statusCode: 400,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Failed to fetch user information',
            code: 'USER_INFO_FETCH_FAILED',
          },
        };
      }

      // 3. 사용자 정보를 내부 User 형태로 변환 및 백엔드 저장
      const user = await this.createOrUpdateUser(userInfoResponse.data);

      // 4. JWT 토큰 생성 (사용자 정보 포함)
      const token = jwtService.generateToken(user);

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        user,
        token, // JWT 토큰 반환
        redirectUrl: config.frontend.baseUrl, // 프론트엔드 URL
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'OAuth callback failed',
          code: 'OAUTH_CALLBACK_FAILED',
        },
      };
    }
  }

  /**
   * 현재 사용자 정보 조회 (JWT 토큰에서 추출)
   */
  async getCurrentUser(token: string): Promise<MeResponse> {
    try {
      // JWT 토큰에서 사용자 정보 추출
      const user = jwtService.extractUser(token);

      if (!user) {
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

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        user,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get current user',
          code: 'GET_USER_FAILED',
        },
      };
    }
  }

  /**
   * 로그아웃 처리 (JWT 토큰 무효화 - 클라이언트에서 쿠키 삭제)
   */
  async logout(): Promise<LogoutResponse> {
    // JWT는 서버에서 무효화할 수 없으므로, 클라이언트에게 쿠키 삭제 지시
    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      message: 'Logged out successfully',
    };
  }

  /**
   * 인증 상태 확인 (JWT 토큰 검증)
   */
  async checkAuthStatus(token?: string): Promise<AuthStatusResponse> {
    if (!token) {
      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        isAuthenticated: false,
      };
    }

    try {
      const decodedUser = jwtService.verifyToken(token);

      if (!decodedUser) {
        return {
          success: true,
          statusCode: 200,
          timestamp: new Date().toISOString(),
          isAuthenticated: false,
        };
      }

      const user: User = {
        id: decodedUser.userId,
        email: decodedUser.email,
        name: decodedUser.name,
        picture: decodedUser.picture,
        provider: decodedUser.provider,
        createdAt: decodedUser.createdAt,
        updatedAt: decodedUser.updatedAt,
      };

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        isAuthenticated: true,
        user: user,
      };
    } catch (error) {
      console.error('Check auth status error:', error);
      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        isAuthenticated: false,
      };
    }
  }

  /**
   * 토큰 갱신 (JWT 토큰 재발급)
   */
  async refreshToken(oldToken: string): Promise<RefreshSessionResponse> {
    try {
      const newToken = jwtService.refreshToken(oldToken);

      if (!newToken) {
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

      const user = jwtService.extractUser(newToken);

      return {
        success: true,
        statusCode: 200,
        timestamp: new Date().toISOString(),
        token: newToken,
        user: user || undefined,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        statusCode: 500,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to refresh token',
          code: 'TOKEN_REFRESH_FAILED',
        },
      };
    }
  }

  /**
   * Google 사용자 정보를 내부 User 형태로 변환 및 백엔드 저장
   */
  private async createOrUpdateUser(googleUser: GoogleUser): Promise<User> {
    try {
      // 1. 백엔드에서 기존 사용자 조회
      const existingUserResponse = await userApiService.getUserById(googleUser.id);

      if (existingUserResponse.success && existingUserResponse.data) {
        // 2. 기존 사용자 업데이트
        const updateResponse = await userApiService.updateUser(googleUser.id, {
          name: googleUser.name,
          picture: googleUser.picture,
        });

        if (updateResponse.success && updateResponse.data) {
          return updateResponse.data;
        }
      }

      // 3. 새 사용자 생성
      const newUser: User = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createResponse = await userApiService.createUser(newUser);

      if (createResponse.success && createResponse.data) {
        return createResponse.data;
      }

      // 백엔드 API 실패시 로컬 데이터 반환
      console.warn('Backend user API failed, using local data');
      return newUser;
    } catch (error) {
      console.error('User creation/update error:', error);

      // 에러 발생시 로컬 데이터 반환
      return {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: 'google',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }
}

export const authService = new AuthService();
