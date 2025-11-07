/**
 * Global Error Handler Middleware
 * Handle semua error dengan format konsisten
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logError } from '../infra/log/logger';
import { config } from '../config/env';

/**
 * Error response format
 */
interface ErrorResponse {
  ok: false;
  code: string;
  message: string;
  details?: any;
}

/**
 * Global error handler middleware
 * 
 * Error Types:
 * - ZodError (400): dari zod validation
 * - N8nError (502): dari n8n webhook failures
 * - RateLimitError (429): dari rate limiter
 * - InternalError (500): unexpected errors
 * 
 * Security:
 * - Tidak expose stack trace di production
 * - Log full error details untuk debugging
 * - Sanitize error messages
 * 
 * @param error - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error untuk debugging
  logError('Error occurred:', {
    message: error.message,
    stack: config.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  let statusCode = 500;
  let errorResponse: ErrorResponse = {
    ok: false,
    code: 'INTERNAL_ERROR',
    message: 'Terjadi kesalahan internal server',
  };

  // Handle ZodError (validation error)
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
  // Handle N8n errors (dari ChatService)
  else if (error.message && error.message.includes('Gagal meneruskan request ke n8n')) {
    statusCode = 502;
    errorResponse = {
      ok: false,
      code: 'N8N_ERROR',
      message: 'Gagal meneruskan request ke n8n',
      details: config.NODE_ENV === 'development' ? error.message : undefined,
    };
  }
  // Handle rate limit errors
  else if (error.message && error.message.includes('Too many requests')) {
    statusCode = 429;
    errorResponse = {
      ok: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak request, coba lagi nanti',
    };
  }
  // Handle CORS errors
  else if (error.message && error.message.includes('CORS')) {
    statusCode = 403;
    errorResponse = {
      ok: false,
      code: 'CORS_ERROR',
      message: 'Origin tidak diizinkan',
    };
  }
  // Handle generic errors
  else {
    statusCode = 500;
    errorResponse = {
      ok: false,
      code: 'INTERNAL_ERROR',
      message: 'Terjadi kesalahan internal server',
      details: config.NODE_ENV === 'development' ? error.message : undefined,
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}
