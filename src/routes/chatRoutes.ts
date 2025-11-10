/**
 * Chat Routes
 * Define API endpoints untuk chat dan health check
 */

import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { rateLimitMiddleware } from '../middlewares/rateLimit';

/**
 * Create chat routes
 * 
 * Routes:
 * - POST /api/chat: Forward chat request ke n8n (dengan rate limiting)
 * - GET /health: Health check endpoint (tanpa rate limiting)
 * 
 * @param chatController - Controller instance untuk handle requests
 * @returns Express router dengan routes terdefinisi
 */
export function createChatRoutes(chatController: ChatController): Router {
  const router = Router();

  /**
   * POST /api/chat
   * Forward chat request ke n8n webhook
   * 
   * Middleware stack:
   * 1. rateLimitMiddleware - Limit 60 requests per 60 seconds per IP
   * 2. chatController.handleChatRequest - Validate dan forward ke n8n
   */
  router.post(
    '/api/chat',
    rateLimitMiddleware,
    (req, res, next) => chatController.handleChatRequest(req, res, next)
  );

  /**
   * GET /api/chat/history/:sessionId
   * Get chat history untuk session tertentu
   * 
   * Query params:
   * - limit: Optional limit jumlah messages (default: all)
   */
  router.get(
    '/api/chat/history/:sessionId',
    (req, res, next) => chatController.handleGetHistory(req, res, next)
  );

  /**
   * GET /health
   * Health check endpoint untuk monitoring
   * 
   * Tidak ada rate limiting untuk health check
   * Check database connection status
   */
  router.get(
    '/health',
    (req, res) => chatController.handleHealthCheck(req, res)
  );

  return router;
}
