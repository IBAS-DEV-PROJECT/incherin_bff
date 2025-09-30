// 시스템 API 서비스
// BFF → Backend Server 시스템 관련 통신 담당

import { ServerHealthResponse, ServerVersionResponse } from '../../types/server/response/system';

export class SystemApiService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';
  }

  // 백엔드 서버 헬스체크 호출
  async fetchHealthCheck(): Promise<ServerHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/internal/health`);

      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('System API health check error:', error);
      throw error;
    }
  }

  // 백엔드 서버 버전 정보 호출
  async fetchVersion(): Promise<ServerVersionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/internal/version`);

      if (!response.ok) {
        throw new Error(`Backend version fetch failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('System API version fetch error:', error);
      throw error;
    }
  }

  // 여러 서비스 상태를 한 번에 가져오기
  async fetchSystemStatus(): Promise<{
    health: ServerHealthResponse;
    version: ServerVersionResponse;
  }> {
    try {
      const [health, version] = await Promise.all([this.fetchHealthCheck(), this.fetchVersion()]);

      return { health, version };
    } catch (error) {
      console.error('System API system status fetch error:', error);
      throw error;
    }
  }
}

export const systemApiService = new SystemApiService();
