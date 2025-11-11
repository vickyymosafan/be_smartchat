import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '../infra/log/logger';
import { config } from '../config/env';

interface ErrorResponse {
  ok: false;
  code: string;
  message: string;
  details?: any;
}

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logError('Error occurred:', {
    message: error.message,
    stack: config.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body,
    errorType: error.constructor.name,
  });

  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    ok: false,
    code: 'INTERNAL_ERROR',
    message: 'Terjadi kesalahan internal server',
  };

  if (error instanceof ZodError) {
    statusCode = 400;
    errorResponse = {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Data yang dikirim tidak valid',
      details: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    };
  }
  else if (error.message && error.message.includes('Gagal meneruskan request ke n8n')) {
    statusCode = 502;
    errorResponse = {
      ok: false,
      code: 'N8N_ERROR',
      message: 'Gagal meneruskan request ke n8n',
      details: config.NODE_ENV === 'development' ? error.message : undefined,
    };
  }
  else if (error.message && error.message.includes('Too many requests')) {
    statusCode = 429;
    errorResponse = {
      ok: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak request, coba lagi nanti',
    };
  }
  else if (error.message && error.message.includes('CORS')) {
    statusCode = 403;
    errorResponse = {
      ok: false,
      code: 'CORS_ERROR',
      message: 'Origin tidak diizinkan',
    };
  }
  else {
    statusCode = 500;
    errorResponse = {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: 'Terjadi kesalahan internal server',
      details: config.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  res.status(statusCode).json(errorResponse);
}
