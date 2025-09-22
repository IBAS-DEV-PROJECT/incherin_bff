"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemController = void 0;
const system_service_1 = require("./system.service");
class SystemController {
    static async getHealth(_req, res) {
        try {
            const health = await system_service_1.systemService.getHealth();
            res.json(health);
        }
        catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                message: 'Service unavailable',
            });
        }
    }
    static async getVersion(_req, res) {
        try {
            const version = await system_service_1.systemService.getVersion();
            res.json(version);
        }
        catch (error) {
            res.status(500).json({
                error: 'Failed to get version info',
            });
        }
    }
}
exports.SystemController = SystemController;
