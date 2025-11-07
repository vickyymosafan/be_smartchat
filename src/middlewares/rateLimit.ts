/**
 * Rate Limiter Middleware
 * Prevent abuse dengan membatasi request per IP
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware
 * 
 * Configuration:
 * - Window: 60 detik (60000ms)
 * - Max requests: 60 per window per IP
 * - Store: in-memory (stateless, reset on restart)
 * 
 * Behavior:
 * - Track requests per IP address
 * - Return 429 Too Many Requests jika melebihi limit
 * - Reset counter setelah window berakhir
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 60 detik
  max: 60, // 60 requests per window
  message: {
    ok: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Terlalu banyak request, coba lagi nanti',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
