// 인증 미들웨어
// 세션 검증 및 req.user 주입

import { Request, Response, NextFunction } from 'express';
import { AuthRequest, User } from '../shared/types/user';
import { sessionService } from '../services/internal/sessionService';

export interface AuthMiddlewareOptions {
  required?: boolean; // 인증 필수 여부
  allowGuest?: boolean; // 게스트 허용 여부
}

/**
 * 인증 미들웨어
 * 세션을 검증하고 req.user에 사용자 정보를 주입합니다.
 */
export const authMiddleware = (options: AuthMiddlewareOptions = {}) => {
  const { required = true, allowGuest = false } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 세션 ID 추출 (쿠키 또는 헤더에서)
      const sessionId = extractSessionId(req);

      if (!sessionId) {
        if (required) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Authentication required',
              code: 'AUTH_REQUIRED',
            },
          });
        }

        if (allowGuest) {
          req.user = undefined;
          return next();
        }

        return res.status(401).json({
          success: false,
          error: {
            message: 'Session not found',
            code: 'SESSION_NOT_FOUND',
          },
        });
      }

      // 세션 유효성 검증
      const session = await sessionService.validateSession(sessionId);

      if (!session) {
        if (required) {
          return res.status(401).json({
            success: false,
            error: {
              message: 'Invalid or expired session',
              code: 'SESSION_INVALID',
            },
          });
        }

        if (allowGuest) {
          req.user = undefined;
          return next();
        }

        return res.status(401).json({
          success: false,
          error: {
            message: 'Session expired',
            code: 'SESSION_EXPIRED',
          },
        });
      }

      // 사용자 정보 조회 (세션에서 userId로 사용자 정보 가져오기)
      const user = await getUserFromSession(session);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        });
      }

      // req에 사용자 정보 주입
      req.user = user;
      req.authSession = session;

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);

      if (required) {
        return res.status(500).json({
          success: false,
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
          },
        });
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
 * 세션 ID 추출 (쿠키 또는 헤더에서)
 */
function extractSessionId(req: Request): string | null {
  // 1. 쿠키에서 세션 ID 추출
  const sessionCookie = req.cookies?.sessionId;
  if (sessionCookie) {
    return sessionCookie;
  }

  // 2. Authorization 헤더에서 세션 ID 추출
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 3. 커스텀 헤더에서 세션 ID 추출
  const sessionHeader = req.headers['x-session-id'] as string;
  if (sessionHeader) {
    return sessionHeader;
  }

  return null;
}

/**
 * 세션에서 사용자 정보 조회
 * TODO: 실제 사용자 정보 조회 로직 구현
 */
async function getUserFromSession(session: any): Promise<User | null> {
  // TODO: 세션의 userId로 사용자 정보를 DB에서 조회
  // 현재는 목업 데이터 반환

  return {
    id: session.userId,
    email: 'user@example.com',
    name: 'Test User',
    picture: 'https://via.placeholder.com/150',
    provider: 'google',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 관리자 권한 확인 미들웨어
 */
export const adminAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      },
    });
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
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
      });
    }

    // TODO: 역할 확인 로직 구현
    // 현재는 모든 사용자를 허용
    next();
  };
};
