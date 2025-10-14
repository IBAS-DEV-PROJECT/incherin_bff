import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 빌드된 파일들을 import
import { config } from '../../dist/config/env.js';
import routes from '../../dist/app/routes.js';
import { errorHandler } from '../../dist/middleware/error.js';

const app = express();

// CORS 미들웨어
app.use(
  cors({
    origin: [
      'http://localhost:5173', // 로컬 개발용
      'http://localhost:3000', // 다른 로컬 포트
      'https://localhost:5173', // HTTPS 로컬
      config.cors.origin, // 환경변수에서 설정된 origin
    ].filter(Boolean), // undefined 제거
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  })
);

// Cookie 파싱 미들웨어 (JWT 토큰 읽기용)
app.use(cookieParser());

// JSON 파싱 미들웨어
app.use(express.json());

// 라우터 등록 (빌드된 모듈 시스템 사용)
app.use(routes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

export const handler = serverless(app);
