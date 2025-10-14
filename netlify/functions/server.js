import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

// 기본 라우트들 (import 없이 직접 구현)
app.get('/auth/status', (req, res) => {
  res.json({
    success: true,
    isAuthenticated: false,
    message: 'Auth status endpoint working',
    timestamp: new Date().toISOString(),
  });
});

app.get('/auth/google', (req, res) => {
  // 환경변수 확인
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!googleClientId || !googleCallbackUrl) {
    return res.json({
      success: false,
      message: 'Google OAuth not configured',
      error: 'GOOGLE_OAUTH_NOT_CONFIGURED',
      env: {
        GOOGLE_CLIENT_ID: googleClientId ? 'SET' : 'NOT SET',
        GOOGLE_CALLBACK_URL: googleCallbackUrl || 'NOT SET',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Google OAuth URL 생성 (간단한 버전)
  const state = Math.random().toString(36).substring(2);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
    googleCallbackUrl
  )}&response_type=code&scope=openid email profile&state=${state}`;

  res.redirect(authUrl);
});

// 기본 에러 핸들링
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 핸들러 (와일드카드 경로 사용 지양: path-to-regexp 에러 방지)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Netlify Functions는 '/.netlify/functions/server/*' 아래로 요청을 전달합니다.
// 내부 Express 앱을 해당 경로에 마운트하여 라우팅이 일치하도록 합니다.
const handlerApp = express();
handlerApp.use('/.netlify/functions/server', app);

export const handler = serverless(handlerApp);
