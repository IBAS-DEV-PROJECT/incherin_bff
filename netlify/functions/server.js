import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

// 빌드된 파일들을 import
import { config } from '../../dist/config/env.js';
import routes from '../../dist/app/routes.js';
import { errorHandler } from '../../dist/middleware/error.js';

const app = express();

// CORS 미들웨어
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// JSON 파싱 미들웨어
app.use(express.json());

// 라우터 등록 (빌드된 모듈 시스템 사용)
app.use(routes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

export const handler = serverless(app);
