/**
 * ChatHistory Routes
 * Define API endpoints untuk chat history management
 */

import { Router } from 'express';
import { ChatHistoryController } from '../controllers/ChatHistoryController';

export function createChatHistoryRoutes(
  chatHistoryController: ChatHistoryController
): Router {
  const router = Router();

  /**
   * POST /histories
   * Create new chat history from first message
   */
  router.post('/histories', (req, res, next) =>
    chatHistoryController.handleCreateHistory(req, res, next)
  );

  /**
   * GET /histories
   * Get all chat histories (across all sessions)
   */
  router.get('/histories', (req, res, next) =>
    chatHistoryController.handleGetAllHistories(req, res, next)
  );

  /**
   * PATCH /histories/:id
   * Rename chat history
   */
  router.patch('/histories/:id', (req, res, next) =>
    chatHistoryController.handleRenameHistory(req, res, next)
  );

  /**
   * DELETE /histories/:id
   * Delete chat history
   */
  router.delete('/histories/:id', (req, res, next) =>
    chatHistoryController.handleDeleteHistory(req, res, next)
  );

  return router;
}
