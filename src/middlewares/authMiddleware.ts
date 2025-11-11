/**
 * Auth Middleware
 * Protect routes dengan token validation
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { logWarn } from '../infra/log/logger';
import { extractBearerToken, extractClientIp } from '../utils/requestUtils';
import { sendError } from '../utils/responseUtils';

// Create singleton AuthService instance
const authService = new AuthService();

/**
 * Auth middleware untuk protect routes
 * 
 * Flow:
 * 1. Extract token dari Authorization header
 * 2. Validate token dengan AuthService (async - check database)
 * 3. Jika valid: allow request
 * 4. Jika invalid: return 401 Unauthorized
 * 
 * Header format: Authorization: Bearer <token>
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      logWarn('Auth middleware: No or invalid authorization header', {
        path: req.path,
        ip: extractClientIp(req),
      });

      sendError(res, 'NO_AUTH_TOKEN', 'Token autentikasi tidak ditemukan atau format tidak valid', 401);
      return;
    }

    // Validate token (async - check database)
    const isValid = await authService.validateToken(token);

    if (!isValid) {
      logWarn('Auth middleware: Invalid or expired token', {
        path: req.path,
        ip: extractClientIp(req),
      });

      sendError(res, 'INVALID_TOKEN', 'Token tidak valid atau sudah expired', 401);
      return;
    }

    // Token valid, allow request
    next();
  } catch (error) {
    next(error);
  }
}
