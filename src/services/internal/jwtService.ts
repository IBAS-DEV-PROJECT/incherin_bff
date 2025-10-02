// JWT 토큰 서비스
// 사용자 인증용 JWT 발급 및 검증

import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { User } from '../../shared/types/user';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google';
  createdAt: Date;
  updatedAt: Date;
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
    this.defaultExpiresIn = '24h'; // 24시간 (세션 대체)
  }

  /**
   * JWT 토큰 발급 (사용자 정보 포함)
   */
  generateToken(user: User, options: JwtOptions = {}): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      iat: Math.floor(Date.now() / 1000),
      exp:
        Math.floor(Date.now() / 1000) +
        this.parseExpiresIn(options.expiresIn || this.defaultExpiresIn),
    };

    return jwt.sign(payload, this.secret, {
      issuer: options.issuer || 'bff-service',
      audience: options.audience || 'client-app',
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

    // 기존 payload를 User 형태로 변환하여 새 토큰 발급
    const user: User = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: payload.provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.generateToken(user, options);
  }

  /**
   * JWT 토큰에서 사용자 ID 추출
   */
  extractUserId(token: string): string | null {
    const payload = this.verifyToken(token);
    return payload?.userId || null;
  }

  /**
   * JWT 토큰에서 사용자 정보 추출
   */
  extractUser(token: string): User | null {
    const payload = this.verifyToken(token);

    if (!payload) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: payload.provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
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
