import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  nodeEnv: process.env.NODE_ENV || 'development',

  // Google OAuth 설정
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/callback',
  },

  // 세션 설정
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24시간
    cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',
  },

  // 백엔드 연동
  backend: {
    apiUrl: process.env.BACKEND_API_URL || 'http://localhost:8000',
    internalJwtSecret: process.env.INTERNAL_JWT_SECRET || 'your-internal-jwt-secret',
  },

  // 프론트엔드 설정
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
};
