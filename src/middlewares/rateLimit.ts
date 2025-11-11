import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    ok: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Terlalu banyak request, coba lagi nanti',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
