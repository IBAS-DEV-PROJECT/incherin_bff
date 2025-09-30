// JWT 토큰 서비스
// 백엔드 API 호출용 내부 JWT 발급 및 관리

import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

export interface JwtPayload {
  userId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface JwtOptions {
  expiresIn?: string | number;
  issuer?: string;
  audience?: string;
}

export class JwtService {
  private secret: string;
  private defaultExpiresIn: string;

  constructor() {
    this.secret = config.backend.internalJwtSecret;
    this.defaultExpiresIn = '1h'; // 1시간
  }

  /**
   * JWT 토큰 발급
   */
  generateToken(userId: string, sessionId: string, options: JwtOptions = {}): string {
    const payload: JwtPayload = {
      userId,
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        this.parseExpiresIn(options.expiresIn || this.defaultExpiresIn),
    };

    return jwt.sign(payload, this.secret, {
      issuer: options.issuer || 'bff-service',
      audience: options.audience || 'backend-api',
      // expiresIn 제거 - payload에 이미 exp 속성이 있음
    } as jwt.SignOptions);
  }

  /**
   * JWT 토큰 검증
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * JWT 토큰 갱신
   */
  refreshToken(token: string, options: JwtOptions = {}): string | null {
    const payload = this.verifyToken(token);

    if (!payload) {
      return null;
    }

    return this.generateToken(payload.userId, payload.sessionId, options);
  }

  /**
   * JWT 토큰에서 사용자 ID 추출
   */
  extractUserId(token: string): string | null {
    const payload = this.verifyToken(token);
    return payload?.userId || null;
  }

  /**
   * JWT 토큰에서 세션 ID 추출
   */
  extractSessionId(token: string): string | null {
    const payload = this.verifyToken(token);
    return payload?.sessionId || null;
  }

  /**
   * JWT 토큰 만료 시간 확인
   */
  isTokenExpired(token: string): boolean {
    const payload = this.verifyToken(token);

    if (!payload) {
      return true;
    }

    return payload.exp < Math.floor(Date.now() / 1000);
  }

  /**
   * JWT 토큰 만료 시간까지 남은 시간 (초)
   */
  getTokenTimeToLive(token: string): number {
    const payload = this.verifyToken(token);

    if (!payload) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }

  /**
   * 만료 시간 파싱 (문자열을 초로 변환)
   */
  private parseExpiresIn(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn;
    }

    // 문자열 파싱 (예: "1h", "30m", "3600s")
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // 기본 1시간
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600;
    }
  }
}

// 기본 JWT 서비스 인스턴스
export const jwtService = new JwtService();
