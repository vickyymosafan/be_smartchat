import cors from 'cors';
import { config } from '../config/env';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (config.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    if (config.NODE_ENV === 'production') {
      if (origin.includes('.vercel.app')) {
        console.log(`[CORS] Allowing Vercel origin: ${origin}`);
        return callback(null, true);
      }
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log(`[CORS] Allowing localhost origin for testing: ${origin}`);
        return callback(null, true);
      }
    }

    const serverPort = config.PORT || 3001;
    const allowedLocalOrigins = [
      `http://localhost:${serverPort}`,
      `http://127.0.0.1:${serverPort}`,
    ];

    if (allowedLocalOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (config.FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Origin rejected: ${origin}`);
    console.warn(`[CORS] Allowed origins: ${config.FRONTEND_ORIGINS.join(', ')}`);

    callback(new Error('Origin tidak diizinkan oleh CORS policy'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
