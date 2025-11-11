/**
 * Response Utilities
 * Standardized response formatting for API endpoints
 */

import { Response } from 'express';

/**
 * Send success response with data
 * 
 * @param res - Express response object
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
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
 * 
 * @param res - Express response object
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
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
 * 
 * @param res - Express response object
 * @param code - Error code
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Optional error details
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
