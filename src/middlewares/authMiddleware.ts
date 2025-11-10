/**
 * Auth Middleware
 * Protect routes dengan token validation
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { logWarn } from '../infra/log/logger';

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
    // Extract token dari Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logWarn('Auth middleware: No authorization header', {
        path: req.path,
        ip: req.ip,
      });

      res.status(401).json({
        ok: false,
        code: 'NO_AUTH_TOKEN',
        message: 'Token autentikasi tidak ditemukan',
      });
      return;
    }

    // Parse Bearer token
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logWarn('Auth middleware: Invalid authorization format', {
        path: req.path,
        ip: req.ip,
      });

      res.status(401).json({
        ok: false,
        code: 'INVALID_AUTH_FORMAT',
        message: 'Format token tidak valid',
      });
      return;
    }

    const token = parts[1];

    // Validate token (async - check database)
    const isValid = await authService.validateToken(token);

    if (!isValid) {
      logWarn('Auth middleware: Invalid or expired token', {
        path: req.path,
        ip: req.ip,
      });

      res.status(401).json({
        ok: false,
        code: 'INVALID_TOKEN',
        message: 'Token tidak valid atau sudah expired',
      });
      return;
    }

    // Token valid, allow request
    next();
  } catch (error) {
    next(error);
  }
}
