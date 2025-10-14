import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// 빌드된 파일들을 import - 절대 경로 사용
import routes from '/var/task/dist/app/routes.js';
import { errorHandler } from '/var/task/dist/middleware/error.js';

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

// 임시 라우트 (빌드된 routes.js import 실패 시 대체)
try {
  app.use(routes);
} catch (error) {
  console.log('Failed to import routes, using fallback routes');

  // 기본 라우트들
  app.get('/auth/status', (req, res) => {
    res.json({
      success: true,
      isAuthenticated: false,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/auth/google', (req, res) => {
    res.json({
      message: 'OAuth endpoint - Google OAuth configuration needed',
      error: 'GOOGLE_OAUTH_NOT_CONFIGURED',
      timestamp: new Date().toISOString(),
    });
  });
}

// 에러 핸들링 미들웨어
try {
  app.use(errorHandler);
} catch (error) {
  console.log('Failed to import error handler, using fallback');
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  });
}

export const handler = serverless(app);
