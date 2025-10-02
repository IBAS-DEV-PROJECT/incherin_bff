// Auth 컨트롤러
// OAuth 플로우 및 인증 관련 HTTP 요청 처리

import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/types/user';
import { authService } from './auth.service';
import {
  OAuthStartRequest,
  OAuthCallbackRequest,
  OAuthCallbackResponse,
  MeResponse,
  LogoutResponse,
  AuthStatusResponse,
  RefreshTokenRequest,
  RefreshSessionResponse,
} from './auth.types';
import { sendInternalError, sendBadRequest, sendUnauthorized, sendOk } from '../../shared/response';

export class AuthController {
  /**
   * Google OAuth 시작
   * GET /auth/google
   */
  static async startOAuth(req: Request<{}, {}, OAuthStartRequest>, res: Response) {
    try {
      const { state, redirectUrl } = req.query;

      // CSRF 보호를 위한 state 파라미터 생성
      const csrfState = (state as string) || generateRandomState();

      // Google OAuth URL 생성
      const authUrl = authService.generateAuthUrl(csrfState);

      // 세션에 state와 redirectUrl 저장 (선택사항)
      if (req.session) {
        req.session.oauthState = csrfState;
        req.session.redirectUrl = redirectUrl as string;
      }

      res.redirect(authUrl);
    } catch (error) {
      console.error('OAuth start error:', error);
      return sendInternalError(res, 'Failed to start OAuth', 'OAUTH_START_FAILED');
    }
  }

  /**
   * Google OAuth 콜백
   * GET /auth/callback
   */
  static async handleOAuthCallback(req: Request<{}, {}, OAuthCallbackRequest>, res: Response) {
    try {
      const { code, state } = req.query;

      if (!code) {
        return sendBadRequest(res, 'Authorization code is required', 'MISSING_CODE');
      }

      // CSRF 보호: state 파라미터 검증
      if (req.session?.oauthState && req.session.oauthState !== state) {
        return sendBadRequest(res, 'Invalid state parameter', 'INVALID_STATE');
      }

      // OAuth 콜백 처리
      const result = await authService.handleOAuthCallback(code as string, state as string);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'OAuth callback failed',
          result.error?.code || 'OAUTH_CALLBACK_FAILED'
        );
      }

      // JWT 토큰 쿠키 설정
      if (result.token) {
        res.cookie('authToken', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24시간
          sameSite: 'lax',
        });
      }

      // OAuth state 정리
      if (req.session) {
        delete req.session.oauthState;
      }

      // 리다이렉트 URL 결정
      const redirectUrl = result.redirectUrl || req.session?.redirectUrl || '/dashboard';

      if (req.session) {
        delete req.session.redirectUrl;
      }

      // 프론트엔드로 리다이렉트
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return sendInternalError(res, 'OAuth callback failed', 'OAUTH_CALLBACK_ERROR');
    }
  }

  /**
   * 현재 사용자 정보 조회
   * GET /auth/me
   */
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const token =
        req.cookies?.authToken || (req.headers['authorization']?.replace('Bearer ', '') as string);

      if (!token) {
        return sendUnauthorized(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      const result = await authService.getCurrentUser(token);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Failed to get user',
          result.error?.code || 'GET_USER_FAILED'
        );
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Get current user error:', error);
      return sendInternalError(res, 'Failed to get current user', 'GET_USER_ERROR');
    }
  }

  /**
   * 로그아웃
   * POST /auth/logout
   */
  static async logout(req: AuthRequest, res: Response) {
    try {
      const result = await authService.logout();

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Logout failed',
          result.error?.code || 'LOGOUT_FAILED'
        );
      }

      // JWT 토큰 쿠키 삭제
      res.clearCookie('authToken');

      return sendOk(res, result);
    } catch (error) {
      console.error('Logout error:', error);
      return sendInternalError(res, 'Logout failed', 'LOGOUT_ERROR');
    }
  }

  /**
   * 인증 상태 확인
   * GET /auth/status
   */
  static async checkAuthStatus(req: Request, res: Response) {
    try {
      const token =
        req.cookies?.authToken || (req.headers['authorization']?.replace('Bearer ', '') as string);

      const result = await authService.checkAuthStatus(token);
      return sendOk(res, result);
    } catch (error) {
      console.error('Check auth status error:', error);
      return sendInternalError(res, 'Failed to check auth status', 'AUTH_STATUS_ERROR');
    }
  }

  /**
   * 토큰 갱신
   * POST /auth/refresh
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const token =
        req.cookies?.authToken || (req.headers['authorization']?.replace('Bearer ', '') as string);

      if (!token) {
        return sendBadRequest(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      const result = await authService.refreshToken(token);

      if (!result.success) {
        return sendBadRequest(
          res,
          result.error?.message || 'Session refresh failed',
          result.error?.code || 'SESSION_REFRESH_FAILED'
        );
      }

      // 새로운 JWT 토큰 쿠키 설정
      if (result.token) {
        res.cookie('authToken', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24시간
          sameSite: 'lax',
        });
      }

      return sendOk(res, result);
    } catch (error) {
      console.error('Refresh session error:', error);
      return sendInternalError(res, 'Failed to refresh session', 'SESSION_REFRESH_ERROR');
    }
  }
}

/**
 * 랜덤 state 생성 (CSRF 보호용)
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
