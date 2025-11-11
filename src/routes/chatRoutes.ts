import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { rateLimitMiddleware } from '../middlewares/rateLimit';

export function createChatRoutes(chatController: ChatController): Router {
  const router = Router();

  router.post(
    '/',
    rateLimitMiddleware,
    (req, res, next) => chatController.handleChatRequest(req, res, next)
  );

  router.get(
    '/history/:sessionId',
    (req, res, next) => chatController.handleGetHistory(req, res, next)
  );

  return router;
}

export function createHealthRoute(chatController: ChatController): Router {
  const router = Router();

  router.get(
    '/health',
    (req, res) => chatController.handleHealthCheck(req, res)
  );

  return router;
}
