import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';

const app = express();

// CORS 미들웨어
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// JSON 파싱 미들웨어
app.use(express.json());

// 시스템 API
app.get('/healthz', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get('/version', (_req, res) => {
  res.json({
    version: process.env.npm_package_version || '1.0.0',
    gitSha: process.env.COMMIT_REF || 'unknown',
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    nodeVersion: process.version,
  });
});

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from BFF!' });
});

// 에러 핸들링
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
    },
  });
});

export const handler = serverless(app);
