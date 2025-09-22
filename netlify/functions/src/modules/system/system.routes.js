"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_controller_1 = require("./system.controller");
const router = (0, express_1.Router)();
// GET /healthz - 헬스체크
router.get('/healthz', system_controller_1.SystemController.getHealth);
// GET /version - 버전 정보
router.get('/version', system_controller_1.SystemController.getVersion);
exports.default = router;
