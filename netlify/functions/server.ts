import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import { config } from '../../src/config/env';
import routes from '../../src/app/routes';
import { errorHandler } from '../../src/middleware/error';

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

// 라우터 등록
app.use(routes);

// 에러 핸들링 미들웨어
app.use(errorHandler);

// Netlify Functions용 serverless 래퍼
export const handler = serverless(app);
