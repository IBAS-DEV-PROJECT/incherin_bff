import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8080,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};
