import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SystemService {
  async getHealth() {
    // 기본적인 헬스체크
    // 나중에 upstream 서비스 ping 등으로 확장 가능
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  async getVersion() {
    const buildTime = process.env.BUILD_TIME || new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';

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
      version: process.env.npm_package_version || '1.0.0',
      gitSha,
      buildTime,
      environment,
      nodeVersion: process.version,
    };
  }
}

export const systemService = new SystemService();
