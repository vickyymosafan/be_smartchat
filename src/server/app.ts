/**
 * Express App Initialization
 * Setup Express application dengan semua middlewares dan routes
 */

import express, { Express } from 'express';
import helmet from 'helmet';
import { requestLogger } from '../infra/log/logger';
import { corsMiddleware } from '../middlewares/cors';
import { errorHandler } from '../middlewares/errorHandler';
import { AxiosHttpClient } from '../infra/http/AxiosHttpClient';
import { ChatService } from '../services/ChatService';
import { ChatController } from '../controllers/ChatController';
import { AuthService } from '../services/AuthService';
import { AuthController } from '../controllers/AuthController';
import { createChatRoutes } from '../routes/chatRoutes';
import { createAuthRoutes } from '../routes/authRoutes';
import { authMiddleware } from '../middlewares/authMiddleware';

/**
 * Initialize Express application
 * 
 * Middleware Order (penting untuk security dan functionality):
 * 1. helmet() - Security headers (X-Frame-Options, X-Content-Type-Options, dll)
 * 2. express.json() - Body parser dengan size limit 1MB
 * 3. requestLogger - Log semua incoming requests
 * 4. corsMiddleware - CORS protection dengan origin whitelist
 * 5. Routes - API endpoints
 * 6. errorHandler - Global error handling (harus terakhir)
 * 
 * Dependency Injection Chain:
 * AxiosHttpClient → ChatService → ChatController → Routes
 */

// Create Express app
const app: Express = express();

// Disable x-powered-by header untuk security
app.disable('x-powered-by');

// Trust proxy untuk Vercel (agar bisa dapat real IP dari X-Forwarded-For)
app.set('trust proxy', 1);

/**
 * Middleware Stack
 */

// 1. Security headers
app.use(helmet());

// 2. Body parser dengan size limit
app.use(express.json({ limit: '1mb' }));

// 3. Request logging
app.use(requestLogger);

// 4. CORS protection
app.use(corsMiddleware);

/**
 * Dependency Injection
 * Wire up semua dependencies dari infrastructure ke presentation layer
 */

// Infrastructure layer: HTTP client dengan retry logic
const httpClient = new AxiosHttpClient();

// Application layer: Business logic services
const chatService = new ChatService(httpClient);
const authService = new AuthService();

// Presentation layer: HTTP request/response controllers
const chatController = new ChatController(chatService);
const authController = new AuthController(authService);

// Routes: API endpoints dengan controllers
const authRoutes = createAuthRoutes(authController);
const chatRoutes = createChatRoutes(chatController);

// 5. Mount routes
// Auth routes (public - no auth required)
app.use(authRoutes);

// Chat routes (protected - auth required)
app.use('/api/chat', authMiddleware);
app.use(chatRoutes);

// 6. Global error handler (harus terakhir)
app.use(errorHandler);

// Export app instance
export { app };
