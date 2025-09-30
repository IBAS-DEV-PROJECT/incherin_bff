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
  RefreshSessionRequest,
  RefreshSessionResponse,
} from './auth.types';

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
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to start OAuth',
          code: 'OAUTH_START_FAILED',
        },
      });
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
        return res.status(400).json({
          success: false,
          error: {
            message: 'Authorization code is required',
            code: 'MISSING_CODE',
          },
        });
      }

      // CSRF 보호: state 파라미터 검증
      if (req.session?.oauthState && req.session.oauthState !== state) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid state parameter',
            code: 'INVALID_STATE',
          },
        });
      }

      // OAuth 콜백 처리
      const result = await authService.handleOAuthCallback(code as string, state as string);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // 세션 쿠키 설정
      if (result.session) {
        res.cookie('sessionId', result.session.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: result.session.expiresAt.getTime() - Date.now(),
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
      res.status(500).json({
        success: false,
        error: {
          message: 'OAuth callback failed',
          code: 'OAUTH_CALLBACK_ERROR',
        },
      });
    }
  }

  /**
   * 현재 사용자 정보 조회
   * GET /auth/me
   */
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.cookies?.sessionId || (req.headers['x-session-id'] as string);

      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND',
          },
        });
      }

      const result = await authService.getCurrentUser(sessionId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get current user',
          code: 'GET_USER_ERROR',
        },
      });
    }
  }

  /**
   * 로그아웃
   * POST /auth/logout
   */
  static async logout(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.cookies?.sessionId || (req.headers['x-session-id'] as string);

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND',
          },
        });
      }

      const result = await authService.logout(sessionId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // 세션 쿠키 삭제
      res.clearCookie('sessionId');

      res.json(result);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Logout failed',
          code: 'LOGOUT_ERROR',
        },
      });
    }
  }

  /**
   * 인증 상태 확인
   * GET /auth/status
   */
  static async checkAuthStatus(req: Request, res: Response) {
    try {
      const sessionId = req.cookies?.sessionId || (req.headers['x-session-id'] as string);

      const result = await authService.checkAuthStatus(sessionId);
      res.json(result);
    } catch (error) {
      console.error('Check auth status error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to check auth status',
          code: 'AUTH_STATUS_ERROR',
        },
      });
    }
  }

  /**
   * 세션 갱신
   * POST /auth/refresh
   */
  static async refreshSession(req: Request<{}, {}, RefreshSessionRequest>, res: Response) {
    try {
      const sessionId = req.cookies?.sessionId || (req.headers['x-session-id'] as string);

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND',
          },
        });
      }

      const result = await authService.refreshSession(sessionId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      // 새로운 세션 쿠키 설정
      if (result.session) {
        res.cookie('sessionId', result.session.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: result.session.expiresAt.getTime() - Date.now(),
          sameSite: 'lax',
        });
      }

      res.json(result);
    } catch (error) {
      console.error('Refresh session error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to refresh session',
          code: 'SESSION_REFRESH_ERROR',
        },
      });
    }
  }
}

/**
 * 랜덤 state 생성 (CSRF 보호용)
 */
function generateRandomState(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
