// API 응답 헬퍼 함수
// 일관된 응답 형식을 보장합니다

import { Response } from 'express';
import { BaseApiResponse } from './types/api';

/**
 * 성공 응답 헬퍼
 */
export const sendSuccess = <T = any>(res: Response, statusCode: number, data: T): Response => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    timestamp: new Date().toISOString(),
    ...data,
  });
};

/**
 * 에러 응답 헬퍼
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  code: string
): Response => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    timestamp: new Date().toISOString(),
    error: {
      message,
      code,
    },
  });
};

/**
 * 200 OK 응답
 */
export const sendOk = <T = any>(res: Response, data: T): Response => {
  return sendSuccess(res, 200, data);
};

/**
 * 201 Created 응답
 */
export const sendCreated = <T = any>(res: Response, data: T): Response => {
  return sendSuccess(res, 201, data);
};

/**
 * 400 Bad Request 응답
 */
export const sendBadRequest = (res: Response, message: string, code: string): Response => {
  return sendError(res, 400, message, code);
};

/**
 * 401 Unauthorized 응답
 */
export const sendUnauthorized = (res: Response, message: string, code: string): Response => {
  return sendError(res, 401, message, code);
};

/**
 * 403 Forbidden 응답
 */
export const sendForbidden = (res: Response, message: string, code: string): Response => {
  return sendError(res, 403, message, code);
};

/**
 * 404 Not Found 응답
 */
export const sendNotFound = (res: Response, message: string, code: string): Response => {
  return sendError(res, 404, message, code);
};

/**
 * 500 Internal Server Error 응답
 */
export const sendInternalError = (res: Response, message: string, code: string): Response => {
  return sendError(res, 500, message, code);
};

/**
 * 503 Service Unavailable 응답
 */
export const sendServiceUnavailable = (res: Response, message: string, code: string): Response => {
  return sendError(res, 503, message, code);
};

/**
 * 204 No Content 응답
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * 302 Found (Redirect) 응답
 */
export const sendRedirect = (res: Response, url: string): void => {
  res.redirect(url);
};

/**
 * 409 Conflict 응답
 */
export const sendConflict = (res: Response, message: string, code: string): Response => {
  return sendError(res, 409, message, code);
};

/**
 * 422 Unprocessable Entity 응답
 */
export const sendUnprocessableEntity = (res: Response, message: string, code: string): Response => {
  return sendError(res, 422, message, code);
};

/**
 * 502 Bad Gateway 응답
 */
export const sendBadGateway = (res: Response, message: string, code: string): Response => {
  return sendError(res, 502, message, code);
};

/**
 * 504 Gateway Timeout 응답
 */
export const sendGatewayTimeout = (res: Response, message: string, code: string): Response => {
  return sendError(res, 504, message, code);
};
