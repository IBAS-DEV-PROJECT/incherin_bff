"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_1 = require("../modules/system");
const router = (0, express_1.Router)();
// 시스템 관련 API
router.use('/', system_1.systemRoutes);
// 기존 테스트 API (나중에 제거 가능)
router.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from BFF!' });
});
exports.default = router;
