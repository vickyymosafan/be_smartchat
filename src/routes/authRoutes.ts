/**
 * Auth Routes
 * Define API endpoints untuk authentication
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter untuk PIN verification
 * Limit: 5 attempts per 15 minutes per IP
 * Prevent brute force attacks
 */
const pinRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    ok: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Create auth routes
 * 
 * Routes:
 * - POST /api/auth/verify-pin: Verify PIN dan generate token (dengan rate limiting)
 * - POST /api/auth/logout: Revoke token dan logout
 * 
 * @param authController - Controller instance untuk handle requests
 * @returns Express router dengan routes terdefinisi
 */
export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  /**
   * POST /api/auth/verify-pin
   * Verify PIN code dan return authentication token
   * 
   * Middleware stack:
   * 1. pinRateLimiter - Limit 5 attempts per 15 minutes per IP
   * 2. authController.handleVerifyPin - Validate PIN dan generate token
   */
  router.post(
    '/api/auth/verify-pin',
    pinRateLimiter,
    (req, res, next) => authController.handleVerifyPin(req, res, next)
  );

  /**
   * POST /api/auth/logout
   * Revoke authentication token
   * No rate limiting needed for logout
   */
  router.post(
    '/api/auth/logout',
    (req, res, next) => authController.handleLogout(req, res, next)
  );

  return router;
}
