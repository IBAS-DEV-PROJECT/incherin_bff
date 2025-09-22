import express from 'express';
import cors from 'cors';
import { config } from '../config/env';
import routes from './routes';
import { errorHandler } from '../middleware/error';

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

// 에러 핸들링 미들웨어 (라우터 다음에 위치)
app.use(errorHandler);

// 서버 시작
app.listen(config.port, () => {
  console.log(`BFF server is running at http://localhost:${config.port}`);
});
