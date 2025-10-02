// API 공통 타입 정의
// 모든 API 응답에서 사용하는 공통 구조

import { Timestamp } from './common';

// 기본 API 응답 구조
export interface BaseApiResponse {
  success: boolean;
  statusCode: number; // HTTP 상태 코드 추가
  timestamp: Timestamp;
}

// 제네릭 API 응답 타입
export interface ApiResponse<T = any> extends BaseApiResponse {
  data?: T;
  message?: string;
}

// 에러 응답 타입
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
    stack?: string; // 개발 환경에서만
  };
}

// 페이지네이션 응답 타입 (나중에 사용할 수 있음)
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}
