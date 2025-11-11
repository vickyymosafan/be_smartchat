import { Response } from 'express';

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
