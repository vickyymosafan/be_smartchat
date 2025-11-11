/**
 * Response Utilities
 * Standardized response formatting and validation for API endpoints
 */

import { Response } from 'express';

/**
 * Send success response with data
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    ok: true,
    data,
  });
}

/**
 * Send success response with message only
 */
export function sendSuccessMessage(
  res: Response,
  message: string,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    ok: true,
    message,
  });
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): void {
  const response: any = {
    ok: false,
    code,
    message,
  };

  if (details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  message: string
): void {
  res.status(400).json({
    ok: false,
    code: 'VALIDATION_ERROR',
    message,
  });
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  fields: string[]
): { isValid: boolean; missing: string[] } {
  const missing = fields.filter(field => !body[field]);
  return {
    isValid: missing.length === 0,
    missing,
  };
}
