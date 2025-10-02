// 데이터 변환 서비스
// Server 응답 → Client 응답으로 변환하는 로직

import { ServerHealthResponse, ServerVersionResponse } from '../../types/server/response/system';
import {
  ClientHealthResponse,
  ClientVersionResponse,
  ClientSystemDashboard,
} from '../../types/client/response/system';

export class DataTransformService {
  // 서버 헬스체크 → 클라이언트 헬스체크 변환
  static transformHealth(serverData: ServerHealthResponse): ClientHealthResponse {
    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      status: serverData.status === 'degraded' ? 'unhealthy' : serverData.status,
      uptime: this.formatUptime(serverData.uptime_seconds),
      memoryUsage: this.formatMemory(serverData.memory),
      services: {
        database: serverData.services.database.status === 'connected' ? 'online' : 'offline',
        cache: serverData.services.redis.status === 'connected' ? 'online' : 'offline',
      },
    };
  }

  // 서버 버전 정보 → 클라이언트 버전 정보 변환
  static transformVersion(serverData: ServerVersionResponse): ClientVersionResponse {
    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      version: serverData.application.version,
      buildInfo: this.formatBuildInfo(serverData),
      environment: this.simplifyEnvironment(serverData.runtime.environment),
    };
  }

  // 여러 서버 데이터 → 클라이언트 대시보드 변환
  static transformSystemDashboard(
    healthData: ServerHealthResponse,
    versionData: ServerVersionResponse
  ): ClientSystemDashboard {
    const overallStatus = this.determineOverallStatus(healthData);
    const alerts = this.generateAlerts(healthData);

    return {
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      overallStatus,
      quickStats: {
        uptime: this.formatUptime(healthData.uptime_seconds),
        version: versionData.application.version,
        environment: this.simplifyEnvironment(versionData.runtime.environment),
      },
      ...(alerts.length > 0 && { alerts }),
    };
  }

  // 헬퍼 메서드들
  private static formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간`;
    }

    return `${hours}시간 ${minutes}분`;
  }

  private static formatMemory(memory: ServerHealthResponse['memory']): string {
    const usedMB = Math.round(memory.heapUsed / 1024 / 1024);
    const totalMB = Math.round(memory.heapTotal / 1024 / 1024);
    return `${usedMB}MB / ${totalMB}MB`;
  }

  private static formatBuildInfo(serverData: ServerVersionResponse): string {
    const shortCommit = serverData.application.git_commit.substring(0, 7);
    const buildDate = new Date(serverData.application.build_timestamp);
    const timeAgo = this.getTimeAgo(buildDate);

    return `v${serverData.application.version} (${shortCommit}) - ${timeAgo}`;
  }

  private static simplifyEnvironment(env: string): 'dev' | 'staging' | 'prod' {
    switch (env) {
      case 'development':
        return 'dev';
      case 'staging':
        return 'staging';
      case 'production':
        return 'prod';
      default:
        return 'dev';
    }
  }

  private static determineOverallStatus(
    healthData: ServerHealthResponse
  ): 'healthy' | 'warning' | 'critical' {
    if (healthData.status === 'unhealthy') return 'critical';
    if (healthData.status === 'degraded') return 'warning';

    // 서비스 상태 체크
    const services = Object.values(healthData.services);
    const hasError = services.some((service) => service.status === 'error');
    const hasDisconnected = services.some((service) => service.status === 'disconnected');

    if (hasError) return 'critical';
    if (hasDisconnected) return 'warning';

    return 'healthy';
  }

  private static generateAlerts(healthData: ServerHealthResponse): string[] {
    const alerts: string[] = [];

    // 메모리 사용량 체크
    const memoryUsagePercent = (healthData.memory.heapUsed / healthData.memory.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      alerts.push('메모리 사용량이 높습니다');
    }

    // CPU 사용량 체크
    if (healthData.cpu.usage_percent > 80) {
      alerts.push('CPU 사용량이 높습니다');
    }

    // 서비스 상태 체크
    Object.entries(healthData.services).forEach(([serviceName, service]) => {
      if (service.status === 'error') {
        alerts.push(`${serviceName} 서비스에 오류가 발생했습니다`);
      } else if (service.status === 'disconnected') {
        alerts.push(`${serviceName} 서비스가 연결되지 않았습니다`);
      }
    });

    return alerts;
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
  }
}

export const dataTransformService = DataTransformService;
