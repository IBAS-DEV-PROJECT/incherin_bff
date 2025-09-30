// Auth 서비스 로직
// Google OAuth 플로우 및 세션 관리

import { GoogleApiService } from '../../services/external/googleApi';
import { sessionService } from '../../services/internal/sessionService';
import { jwtService } from '../../services/internal/jwtService';
import { config } from '../../config/env';
import { User, AuthSession, GoogleUser } from '../../shared/types/user';
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
          timestamp: new Date().toISOString(),
          error: {
            message: 'Failed to fetch user information',
            code: 'USER_INFO_FETCH_FAILED',
          },
        };
      }

      // 3. 사용자 정보를 내부 User 형태로 변환
      const user = await this.createOrUpdateUser(userInfoResponse.data);

      // 4. 세션 생성
      const session = await sessionService.issueSession({
        userId: user.id,
        expiresIn: config.session.maxAge,
      });

      // 5. 내부 JWT 토큰 생성 (백엔드 API 호출용)
      const internalToken = jwtService.generateToken(user.id, session.sessionId);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        user,
        session,
        redirectUrl: config.frontend.baseUrl, // 프론트엔드 URL
      };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: 'OAuth callback failed',
          code: 'OAUTH_CALLBACK_FAILED',
        },
      };
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(sessionId: string): Promise<MeResponse> {
    try {
      const session = await sessionService.validateSession(sessionId);

      if (!session) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Invalid session',
            code: 'INVALID_SESSION',
          },
        };
      }

      // TODO: 실제 사용자 정보 조회 로직 구현
      const user = await this.getUserById(session.userId);

      if (!user) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        };
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        user,
        session,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to get current user',
          code: 'GET_USER_FAILED',
        },
      };
    }
  }

  /**
   * 로그아웃 처리
   */
  async logout(sessionId: string): Promise<LogoutResponse> {
    try {
      const revoked = await sessionService.revokeSession(sessionId);

      if (!revoked) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Failed to revoke session',
          error: {
            message: 'Failed to revoke session',
            code: 'LOGOUT_FAILED',
          },
        };
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Logout failed',
        error: {
          message: 'Logout failed',
          code: 'LOGOUT_ERROR',
        },
      };
    }
  }

  /**
   * 인증 상태 확인
   */
  async checkAuthStatus(sessionId?: string): Promise<AuthStatusResponse> {
    if (!sessionId) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        isAuthenticated: false,
      };
    }

    try {
      const session = await sessionService.validateSession(sessionId);

      if (!session) {
        return {
          success: true,
          timestamp: new Date().toISOString(),
          isAuthenticated: false,
        };
      }

      const user = await this.getUserById(session.userId);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        isAuthenticated: true,
        user: user || undefined,
        session,
      };
    } catch (error) {
      console.error('Check auth status error:', error);
      return {
        success: true,
        timestamp: new Date().toISOString(),
        isAuthenticated: false,
      };
    }
  }

  /**
   * 세션 갱신
   */
  async refreshSession(sessionId: string): Promise<RefreshSessionResponse> {
    try {
      const session = await sessionService.validateSession(sessionId);

      if (!session) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Invalid session',
            code: 'INVALID_SESSION',
          },
        };
      }

      const extendedSession = await sessionService.extendSession(sessionId);

      if (!extendedSession) {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          error: {
            message: 'Failed to extend session',
            code: 'SESSION_EXTEND_FAILED',
          },
        };
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        session: extendedSession,
        expiresAt: extendedSession.expiresAt,
      };
    } catch (error) {
      console.error('Refresh session error:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Failed to refresh session',
          code: 'SESSION_REFRESH_FAILED',
        },
      };
    }
  }

  /**
   * Google 사용자 정보를 내부 User 형태로 변환
   */
  private async createOrUpdateUser(googleUser: GoogleUser): Promise<User> {
    // TODO: 실제 사용자 생성/업데이트 로직 구현
    // 현재는 목업 데이터 반환

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

  /**
   * 사용자 ID로 사용자 정보 조회
   */
  private async getUserById(userId: string): Promise<User | null> {
    // TODO: 실제 사용자 조회 로직 구현
    // 현재는 목업 데이터 반환

    return {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      picture: 'https://via.placeholder.com/150',
      provider: 'google',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export const authService = new AuthService();
