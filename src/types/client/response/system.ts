// Client API 응답 타입 (Frontend ← BFF)
// 프론트엔드가 받는 간소화되고 사용자 친화적인 데이터 구조

import { BaseApiResponse } from '../../../shared/types/api';

// 클라이언트용 헬스체크 응답 (간소화)
export interface ClientHealthResponse extends BaseApiResponse {
  status: 'healthy' | 'unhealthy';
  uptime: string; // "2 hours 30 minutes" 형태로 변환
  memoryUsage: string; // "120MB / 512MB" 형태로 변환
  services?: {
    database?: 'online' | 'offline';
    cache?: 'online' | 'offline';
  };
}

// 클라이언트용 버전 정보 응답 (간소화)
export interface ClientVersionResponse extends BaseApiResponse {
  version: string;
  buildInfo: string; // "v1.2.3 (abc1234) - 2 hours ago" 형태로 변환
  environment: 'dev' | 'staging' | 'prod'; // 더 간단한 환경 구분
}

// 클라이언트용 시스템 상태 대시보드 (여러 정보 조합)
export interface ClientSystemDashboard extends BaseApiResponse {
  overallStatus: 'healthy' | 'warning' | 'critical';
  quickStats: {
    uptime: string;
    version: string;
    environment: string;
  };
  alerts?: string[]; // 사용자에게 보여줄 알림 메시지들
}
