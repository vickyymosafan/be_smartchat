/**
 * Auth Controller
 * Handle HTTP requests untuk authentication
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { pinVerifySchema } from '../schemas/authSchemas';
import { logInfo, logWarn } from '../infra/log/logger';

export class AuthController {
  /**
   * Constructor dengan dependency injection
   * @param authService - Service untuk handle auth logic
   */
  constructor(private authService: AuthService) {}

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
  handleVerifyPin(req: Request, res: Response, next: NextFunction): void {
    try {
      // Validate request body
      const validation = pinVerifySchema.safeParse(req.body);

      if (!validation.success) {
        logWarn('PIN verification failed: Invalid request format', {
          errors: validation.error.errors,
          ip: req.ip,
        });

        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'Format PIN tidak valid',
          details: validation.error.errors,
        });
        return;
      }

      const { pin } = validation.data;

      // Verify PIN
      const isValid = this.authService.verifyPin(pin);

      if (!isValid) {
        logWarn('PIN verification failed: Invalid PIN', {
          ip: req.ip,
        });

        res.status(401).json({
          ok: false,
          code: 'INVALID_PIN',
          message: 'PIN yang Anda masukkan salah',
        });
        return;
      }

      // Generate token
      const token = this.authService.generateToken();

      logInfo('PIN verification successful', {
        ip: req.ip,
        activeTokens: this.authService.getActiveTokensCount(),
      });

      res.status(200).json({
        ok: true,
        data: {
          token,
          expiresIn: '24h',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
