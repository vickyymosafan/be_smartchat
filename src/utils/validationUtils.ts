/**
 * Validation Utilities
 * Common validation helpers for controllers
 */

import { Response } from 'express';

/**
 * Standard validation error response
 */
export interface ValidationErrorResponse {
  ok: false;
  code: 'VALIDATION_ERROR';
  message: string;
}

/**
 * Send validation error response
 * 
 * @param res - Express response object
 * @param message - Error message
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
 * 
 * @param body - Request body object
 * @param fields - Array of required field names
 * @returns Object with isValid flag and missing fields array
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
