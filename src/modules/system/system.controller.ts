import { Request, Response } from 'express';
import { systemService } from './system.service';
import { HealthCheckResponse, VersionResponse } from './system.types';

export class SystemController {
  static async getHealth(_req: Request, res: Response) {
    try {
      const health: HealthCheckResponse = await systemService.getHealth();
      res.json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        message: 'Service unavailable',
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async getVersion(_req: Request, res: Response) {
    try {
      const version: VersionResponse = await systemService.getVersion();
      res.json(version);
    } catch (error) {
      res.status(500).json({
        error: {
          message: 'Failed to get version info',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}
