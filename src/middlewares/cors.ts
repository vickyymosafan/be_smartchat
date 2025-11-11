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

    // Development: Allow all localhost origins
    if (config.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Production: Allow all Vercel preview/production domains
    if (config.NODE_ENV === 'production') {
      if (origin.includes('.vercel.app')) {
        console.log(`[CORS] Allowing Vercel origin: ${origin}`);
        return callback(null, true);
      }
    }

    // Allow same-origin requests (dashboard di localhost:PORT)
    const serverPort = config.PORT || 3001;
    const allowedLocalOrigins = [
      `http://localhost:${serverPort}`,
      `http://127.0.0.1:${serverPort}`,
    ];

    if (allowedLocalOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check apakah origin ada di whitelist
    if (config.FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origin untuk debugging
    console.warn(`[CORS] Origin rejected: ${origin}`);
    console.warn(`[CORS] Allowed origins: ${config.FRONTEND_ORIGINS.join(', ')}`);

    // Reject origin yang tidak di whitelist
    callback(new Error('Origin tidak diizinkan oleh CORS policy'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
