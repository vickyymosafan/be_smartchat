/**
 * CORS Middleware
 * Whitelist frontend origins untuk keamanan
 */

import cors from 'cors';
import { config } from '../config/env';

/**
 * CORS middleware dengan origin whitelist
 * 
 * Configuration:
 * - Origin: check whitelist dari config.FRONTEND_ORIGINS
 * - Methods: GET, POST
 * - Headers: Content-Type, Authorization
 * - Credentials: enabled
 * 
 * Behavior:
 * - Allow requests dari origin yang ada di whitelist
 * - Allow requests tanpa origin (mobile apps, curl, etc.)
 * - Reject requests dari origin yang tidak di whitelist
 * - Handle preflight OPTIONS requests
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests tanpa origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check apakah origin ada di whitelist
    if (config.FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Reject origin yang tidak di whitelist
    callback(new Error('Origin tidak diizinkan oleh CORS policy'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
