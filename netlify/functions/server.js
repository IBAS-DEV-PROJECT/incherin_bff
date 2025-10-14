import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 빌드된 파일들을 import
import routes from '../../dist/app/routes.js';
import { errorHandler } from '../../dist/middleware/error.js';

const app = express();

// CORS 미들웨어 - 환경변수 직접 사용
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  })
);

// Cookie 파싱 미들웨어 (JWT 토큰 읽기용)
app.use(cookieParser());

// JSON 파싱 미들웨어
app.use(express.json());

// 디버깅용 라우트
app.get('/debug', (req, res) => {
  res.json({
    message: 'Netlify Function is working',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      FRONTEND_URL: process.env.FRONTEND_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    },
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
  });
});

// 라우터 등록 (빌드된 모듈 시스템 사용)
app.use(routes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

export const handler = serverless(app);
