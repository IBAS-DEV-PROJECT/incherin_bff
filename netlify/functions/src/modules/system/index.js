"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemService = exports.SystemController = exports.systemRoutes = void 0;
var system_routes_1 = require("./system.routes");
Object.defineProperty(exports, "systemRoutes", { enumerable: true, get: function () { return __importDefault(system_routes_1).default; } });
var system_controller_1 = require("./system.controller");
Object.defineProperty(exports, "SystemController", { enumerable: true, get: function () { return system_controller_1.SystemController; } });
var system_service_1 = require("./system.service");
Object.defineProperty(exports, "systemService", { enumerable: true, get: function () { return system_service_1.systemService; } });
