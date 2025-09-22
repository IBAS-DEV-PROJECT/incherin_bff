"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const serverless_http_1 = __importDefault(require("serverless-http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("../../src/config/env");
const routes_1 = __importDefault(require("../../src/app/routes"));
const error_1 = require("../../src/middleware/error");
const app = (0, express_1.default)();
// CORS 미들웨어
app.use((0, cors_1.default)({
    origin: env_1.config.cors.origin,
    credentials: true,
}));
// JSON 파싱 미들웨어
app.use(express_1.default.json());
// 라우터 등록
app.use(routes_1.default);
// 에러 핸들링 미들웨어
app.use(error_1.errorHandler);
// Netlify Functions용 serverless 래퍼
exports.handler = (0, serverless_http_1.default)(app);
