import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../shared/types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode = 500, message } = err;

  console.error('Error:', {
    statusCode,
    message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? 'Internal Server Error' : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
