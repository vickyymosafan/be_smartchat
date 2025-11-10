/**
 * ChatHistory Controller
 * Handle HTTP request/response untuk chat history endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ChatHistoryService } from '../services/ChatHistoryService';

export class ChatHistoryController {
  constructor(private chatHistoryService: ChatHistoryService) {}

  /**
   * Handle POST /api/chat/histories
   * Create new chat history from first message
   */
  async handleCreateHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId, firstMessage } = req.body;

      if (!sessionId || !firstMessage) {
        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'sessionId and firstMessage are required',
        });
        return;
      }

      const history = await this.chatHistoryService.createFromMessage(
        sessionId,
        firstMessage
      );

      res.status(201).json({
        ok: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle GET /api/chat/histories
   * Get all chat histories (across all sessions)
   */
  async handleGetAllHistories(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const histories = await this.chatHistoryService.getAllHistories();

      res.status(200).json({
        ok: true,
        data: histories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle PATCH /api/chat/histories/:id
   * Rename chat history
   */
  async handleRenameHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { title } = req.body;

      if (!title) {
        res.status(400).json({
          ok: false,
          code: 'VALIDATION_ERROR',
          message: 'title is required',
        });
        return;
      }

      const updated = await this.chatHistoryService.renameHistory(id, title);

      res.status(200).json({
        ok: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle DELETE /api/chat/histories/:id
   * Delete chat history
   */
  async handleDeleteHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await this.chatHistoryService.deleteHistory(id);

      res.status(200).json({
        ok: true,
        message: 'Chat history deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
