// 인증 미들웨어
// JWT 토큰 검증 및 req.user 주입

import { Request, Response, NextFunction } from 'express';
import { AuthRequest, User } from '../shared/types/user';
import { jwtService } from '../services/internal/jwtService';
import { sendUnauthorized } from '../shared/response';

export interface AuthMiddlewareOptions {
  required?: boolean; // 인증 필수 여부
  allowGuest?: boolean; // 게스트 허용 여부
}

/**
 * 인증 미들웨어
 * JWT 토큰을 검증하고 req.user에 사용자 정보를 주입합니다.
 */
export const authMiddleware = (options: AuthMiddlewareOptions = {}) => {
  const { required = true, allowGuest = false } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // JWT 토큰 추출 (쿠키 또는 헤더에서)
      const token = extractToken(req);

      if (!token) {
        if (required) {
          return sendUnauthorized(res, 'Authentication required', 'AUTH_REQUIRED');
        }

        if (allowGuest) {
          req.user = undefined;
          return next();
        }

        return sendUnauthorized(res, 'Token not found', 'TOKEN_NOT_FOUND');
      }

      // JWT 토큰 검증 및 사용자 정보 추출
      const user = jwtService.extractUser(token);

      if (!user) {
        if (required) {
          return sendUnauthorized(res, 'Invalid or expired token', 'TOKEN_INVALID');
        }

        if (allowGuest) {
          req.user = undefined;
          return next();
        }

        return sendUnauthorized(res, 'Token expired', 'TOKEN_EXPIRED');
      }

      // req에 사용자 정보 주입
      req.user = user;

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);

      if (required) {
        return sendUnauthorized(res, 'Authentication failed', 'AUTH_ERROR');
      }

      next();
    }
  };
};

/**
 * 선택적 인증 미들웨어 (인증되지 않아도 통과)
 */
export const optionalAuthMiddleware = authMiddleware({ required: false, allowGuest: true });

/**
 * 필수 인증 미들웨어 (인증 필수)
 */
export const requireAuthMiddleware = authMiddleware({ required: true });

/**
 * JWT 토큰 추출 (쿠키 또는 헤더에서)
 */
function extractToken(req: Request): string | null {
  // 1. 쿠키에서 JWT 토큰 추출
  const tokenCookie = req.cookies?.authToken;
  if (tokenCookie) {
    return tokenCookie;
  }

  // 2. Authorization 헤더에서 JWT 토큰 추출
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 3. 커스텀 헤더에서 JWT 토큰 추출
  const tokenHeader = req.headers['x-auth-token'] as string;
  if (tokenHeader) {
    return tokenHeader;
  }

  return null;
}

/**
 * 관리자 권한 확인 미들웨어
 */
export const adminAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required', 'AUTH_REQUIRED');
  }

  // TODO: 관리자 권한 확인 로직 구현
  // 현재는 모든 사용자를 관리자로 간주
  next();
};

/**
 * 특정 역할 확인 미들웨어
 */
export const roleAuthMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required', 'AUTH_REQUIRED');
    }

    // TODO: 역할 확인 로직 구현
    // 현재는 모든 사용자를 허용
    next();
  };
};
