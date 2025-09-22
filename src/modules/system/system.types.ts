// 시스템 도메인 전용 타입 정의
// 헬스체크, 버전 정보 등 시스템 관련 타입들

import { BaseApiResponse } from '../../shared/types/api';
import { HealthStatus, Environment, Timestamp } from '../../shared/types/common';

// 헬스체크 응답 타입
export interface HealthCheckResponse extends BaseApiResponse {
  status: HealthStatus;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  services?: {
    [key: string]: 'connected' | 'disconnected';
  };
}

// 버전 정보 응답 타입
export interface VersionResponse extends BaseApiResponse {
  version: string;
  gitSha: string;
  buildTime: Timestamp;
  environment: Environment;
  nodeVersion: string;
  dependencies?: {
    [key: string]: string;
  };
  bffVersion?: string; // BFF 자체 버전
  deployedAt?: string; // 배포 시간
  backendStatus?: 'connected' | 'disconnected'; // 백엔드 연결 상태
}

// 시스템 관련 추가 타입들 (확장 가능)
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: NodeJS.MemoryUsage;
  uptime: number;
  loadAverage: number[];
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: Timestamp;
}
