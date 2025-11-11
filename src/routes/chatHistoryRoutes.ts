import { Router } from 'express';
import { ChatHistoryController } from '../controllers/ChatHistoryController';

export function createChatHistoryRoutes(
  chatHistoryController: ChatHistoryController
): Router {
  const router = Router();

  router.post('/histories', (req, res, next) =>
    chatHistoryController.handleCreateHistory(req, res, next)
  );

  router.get('/histories', (req, res, next) =>
    chatHistoryController.handleGetAllHistories(req, res, next)
  );

  router.patch('/histories/:id', (req, res, next) =>
    chatHistoryController.handleRenameHistory(req, res, next)
  );

  router.delete('/histories/:id', (req, res, next) =>
    chatHistoryController.handleDeleteHistory(req, res, next)
  );

  return router;
}
