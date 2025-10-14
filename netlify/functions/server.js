import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from '../../dist/src/app/routes.js';
import { errorHandler } from '../../dist/src/middleware/error.js';

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

// 라우터 등록 (단일 진입: Netlify 리다이렉트 대상 경로로만 마운트)
app.use('/.netlify/functions/server', routes);

// 정식 에러 핸들러
app.use(errorHandler);

// 404 핸들러 (와일드카드 경로 사용 지양: path-to-regexp 에러 방지)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Netlify는 원래 경로(/api/...) 그대로 전달하므로 앱을 그대로 내보냅니다.
export const handler = serverless(app);
