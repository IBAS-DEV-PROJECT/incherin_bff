// Auth 도메인 전용 타입 정의
// 인증 관련 타입들

import { BaseApiResponse } from '../../shared/types/api';
import { User, GoogleUser, GoogleToken } from '../../shared/types/user';

// OAuth 시작 요청
export interface OAuthStartRequest {
  state?: string; // CSRF 보호용
  redirectUrl?: string; // 로그인 후 리다이렉트할 URL
}

// OAuth 콜백 요청
export interface OAuthCallbackRequest {
  code: string;
  state?: string;
}

// OAuth 콜백 응답
export interface OAuthCallbackResponse extends BaseApiResponse {
  user?: User;
  token?: string; // JWT 토큰
  redirectUrl?: string;
  error?: {
    message: string;
    code: string;
  };
}

// 현재 사용자 정보 응답
export interface MeResponse extends BaseApiResponse {
  user?: User;
  error?: {
    message: string;
    code: string;
  };
}

// 로그아웃 응답
export interface LogoutResponse extends BaseApiResponse {
  message: string;
  error?: {
    message: string;
    code: string;
  };
}

// 인증 상태 응답
export interface AuthStatusResponse extends BaseApiResponse {
  isAuthenticated: boolean;
  user?: User;
}

// Google OAuth 설정
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope: string[];
}

// OAuth 에러 타입
export interface OAuthError {
  code: string;
  message: string;
  details?: any;
}

// 토큰 갱신 요청
export interface RefreshTokenRequest {
  token: string;
}

// 토큰 갱신 응답
export interface RefreshSessionResponse extends BaseApiResponse {
  token?: string; // 새 JWT 토큰
  user?: User;
  error?: {
    message: string;
    code: string;
  };
}
