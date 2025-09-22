// 전역 공통 타입 정의
// 모든 도메인에서 사용하는 기본 타입들

export type Environment = 'development' | 'production' | 'staging';
export type HealthStatus = 'healthy' | 'unhealthy';
export type ServiceStatus = 'connected' | 'disconnected';
export type Timestamp = string;
export type Status = 'success' | 'error' | 'pending';
