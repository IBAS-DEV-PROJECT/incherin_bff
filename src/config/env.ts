import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  cors: {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  nodeEnv: process.env.NODE_ENV || 'development',

  // Google OAuth 설정
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },

  // 세션 설정
  session: {
    secret: process.env.SESSION_SECRET || 'default-session-secret',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'), // 24시간
    cookieDomain: process.env.COOKIE_DOMAIN || '',
  },

  // 백엔드 연동
  backend: {
    apiUrl: process.env.BACKEND_API_URL || '',
    internalJwtSecret: process.env.INTERNAL_JWT_SECRET || 'default-jwt-secret',
  },

  // 프론트엔드 설정
  frontend: {
    baseUrl: process.env.FRONTEND_URL || '',
  },
};
