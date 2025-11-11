/**
 * Auth Controller
 * Handle HTTP requests untuk authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { pinVerifySchema } from '../schemas/authSchemas';
import { logInfo, logWarn } from '../infra/log/logger';
import { extractBearerToken, extractClientIp, extractUserAgent } from '../utils/requestUtils';
import { sendSuccess, sendSuccessMessage, sendError } from '../utils/responseUtils';

export class AuthController {
  /**
   * Constructor dengan dependency injection
   * @param authService - Service untuk handle auth logic
   */
  constructor(private authService: AuthService) {}

  /**
   * Handle POST /api/auth/logout request
   * 
   * Flow:
   * 1. Extract token dari Authorization header
   * 2. Revoke token dengan authService
   * 3. Return success response
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function untuk error handling
   */
  async handleLogout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = extractBearerToken(req);
      
      if (token) {
        await this.authService.revokeToken(token);
        logInfo('User logged out', { ip: extractClientIp(req) });
      }

      sendSuccessMessage(res, 'Logout berhasil');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle POST /api/auth/verify-pin request
   * 
   * Flow:
   * 1. Parse request body
   * 2. Validate dengan pinVerifySchema
   * 3. Verify PIN dengan authService
   * 4. Jika valid: generate token dan return
   * 5. Jika invalid: return error
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function untuk error handling
   */
  async handleVerifyPin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validation = pinVerifySchema.safeParse(req.body);

      if (!validation.success) {
        logWarn('PIN verification failed: Invalid request format', {
          errors: validation.error.errors,
          ip: extractClientIp(req),
        });

        sendError(res, 'VALIDATION_ERROR', 'Format PIN tidak valid', 400, validation.error.errors);
        return;
      }

      const { pin } = validation.data;
      const ipAddress = extractClientIp(req);
      const userAgent = extractUserAgent(req);

      // Verify PIN with brute force protection
      const result = await this.authService.verifyPin(pin, ipAddress);

      if (!result.valid) {
        logWarn('PIN verification failed', { ip: ipAddress, message: result.message });
        sendError(res, 'INVALID_PIN', result.message || 'PIN yang Anda masukkan salah', 401);
        return;
      }

      // Generate token (async - save to database with metadata)
      const token = await this.authService.generateToken(ipAddress, userAgent);
      const activeTokens = await this.authService.getActiveTokensCount();

      logInfo('PIN verification successful', { ip: ipAddress, activeTokens });

      sendSuccess(res, { token, expiresIn: '24h' });
    } catch (error) {
      next(error);
    }
  }
}
