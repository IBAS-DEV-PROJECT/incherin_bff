// 사용자 관련 공통 타입 정의
// 모든 도메인에서 공통으로 사용되는 사용자 타입들

import { Request } from 'express';

// Express 세션 타입 확장
declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    redirectUrl?: string;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google';
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
  given_name?: string;
  family_name?: string;
}

export interface GoogleToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  redirectUrl?: string;
}

// JWT Payload 타입 정의 (User 정보를 포함)
export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google';
  createdAt: Date;
  updatedAt: Date;
  iat: number; // Issued At
  exp: number; // Expiration Time
}
