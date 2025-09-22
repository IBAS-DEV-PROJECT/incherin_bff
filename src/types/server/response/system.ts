// Server API 응답 타입 (BFF ← Backend)
// 백엔드 서버에서 받는 원본 데이터 구조

import { Timestamp } from '../../../shared/types/common';

// 백엔드 서버의 헬스체크 응답 (상세한 원본 데이터)
export interface ServerHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Timestamp;
  uptime_seconds: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpu: {
    usage_percent: number;
    load_average: number[];
  };
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      response_time_ms: number;
      last_checked: Timestamp;
    };
    redis: {
      status: 'connected' | 'disconnected' | 'error';
      response_time_ms: number;
      last_checked: Timestamp;
    };
    external_api: {
      status: 'available' | 'unavailable' | 'timeout';
      response_time_ms: number;
      last_checked: Timestamp;
    };
  };
}

// 백엔드 서버의 버전 정보 응답 (상세한 원본 데이터)
export interface ServerVersionResponse {
  application: {
    name: string;
    version: string;
    build_number: string;
    git_commit: string;
    git_branch: string;
    build_timestamp: Timestamp;
  };
  runtime: {
    node_version: string;
    platform: string;
    architecture: string;
    environment: 'development' | 'staging' | 'production';
  };
  dependencies: {
    [key: string]: string;
  };
  deployment: {
    deployed_at: Timestamp;
    deployed_by: string;
    server_id: string;
  };
}
