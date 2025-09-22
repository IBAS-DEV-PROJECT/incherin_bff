import { Request, Response } from 'express';
import { systemService } from './system.service';

export class SystemController {
  static async getHealth(_req: Request, res: Response) {
    try {
      const health = await systemService.getHealth();
      res.json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        message: 'Service unavailable',
      });
    }
  }

  static async getVersion(_req: Request, res: Response) {
    try {
      const version = await systemService.getVersion();
      res.json(version);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get version info',
      });
    }
  }
}
