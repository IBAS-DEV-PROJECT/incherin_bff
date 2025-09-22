import { exec } from 'child_process';
import { promisify } from 'util';
import { HealthCheckResponse, VersionResponse } from './system.types';
import { backendApiService } from '../../services/external/backendApi';
import { dataTransformService } from '../../services/internal/dataTransform';

const execAsync = promisify(exec);

export class SystemService {
  async getHealth(): Promise<HealthCheckResponse> {
    try {
      // 1. 백엔드 서버에서 상세한 헬스체크 데이터 가져오기
      const serverHealthData = await backendApiService.fetchHealthCheck();

      // 2. 서버 데이터를 클라이언트용으로 변환
      const transformedData = dataTransformService.transformHealth(serverHealthData);

      // 3. BFF 자체 상태 정보 추가 (비즈니스 로직)
      return {
        success: true,
        timestamp: new Date().toISOString(),
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          bff: 'connected', // BFF 자체 상태
          backend: 'connected', // 백엔드 연결 상태
        },
      };
    } catch (error) {
      // 백엔드 연결 실패 시 fallback - BFF 자체 상태만 반환
      console.warn('Backend health check failed, returning BFF status only:', error);

      return {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          bff: 'connected',
          backend: 'disconnected', // 백엔드 연결 실패 표시
        },
      };
    }
  }

  async getVersion(): Promise<VersionResponse> {
    try {
      // 1. 백엔드 서버에서 버전 정보 가져오기
      const serverVersionData = await backendApiService.fetchVersion();

      // 2. 서버 데이터를 클라이언트용으로 변환
      const transformedData = dataTransformService.transformVersion(serverVersionData);

      // 3. BFF 자체 버전 정보 추가 (비즈니스 로직)
      const buildTime = process.env.BUILD_TIME || new Date().toISOString();
      const environment =
        (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development';

      let gitSha = process.env.GIT_SHA || 'unknown';
      if (gitSha === 'unknown') {
        try {
          const { stdout } = await execAsync('git rev-parse --short HEAD');
          gitSha = stdout.trim();
        } catch (error) {
          // Git이 없거나 실행 실패시 기본값 유지
        }
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        gitSha,
        buildTime,
        environment,
        nodeVersion: process.version,
        bffVersion: process.env.npm_package_version || '1.0.0',
        deployedAt: process.env.DEPLOYED_AT || new Date().toISOString(),
      };
    } catch (error) {
      // 백엔드 연결 실패 시 fallback - BFF 정보만 반환
      console.warn('Backend version fetch failed, returning BFF version only:', error);

      const buildTime = process.env.BUILD_TIME || new Date().toISOString();
      const environment =
        (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development';

      let gitSha = process.env.GIT_SHA || 'unknown';

      // Git SHA 자동 추출 시도 (개발 환경에서)
      if (gitSha === 'unknown') {
        try {
          const { stdout } = await execAsync('git rev-parse --short HEAD');
          gitSha = stdout.trim();
        } catch (error) {
          // Git이 없거나 실행 실패시 기본값 유지
        }
      }

      return {
        success: true,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        gitSha,
        buildTime,
        environment,
        nodeVersion: process.version,
        // 백엔드 연결 실패 표시
        backendStatus: 'disconnected',
      };
    }
  }
}

export const systemService = new SystemService();
