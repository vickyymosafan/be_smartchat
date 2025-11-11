import { Request, Response, NextFunction } from 'express';
import { ChatHistoryService } from '../services/ChatHistoryService';
import { sendSuccess, sendSuccessMessage, sendValidationError, validateRequiredFields } from '../utils/responseUtils';

export class ChatHistoryController {
  constructor(private chatHistoryService: ChatHistoryService) {}

  async handleCreateHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validation = validateRequiredFields(req.body, ['sessionId', 'firstMessage']);
      
      if (!validation.isValid) {
        sendValidationError(res, `${validation.missing.join(', ')} are required`);
        return;
      }

      const { sessionId, firstMessage } = req.body;
      const history = await this.chatHistoryService.createFromMessage(sessionId, firstMessage);

      sendSuccess(res, history, 201);
    } catch (error) {
      next(error);
    }
  }

  async handleGetAllHistories(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const histories = await this.chatHistoryService.getAllHistories();
      sendSuccess(res, histories);
    } catch (error) {
      next(error);
    }
  }

  async handleRenameHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const validation = validateRequiredFields(req.body, ['title']);

      if (!validation.isValid) {
        sendValidationError(res, 'title is required');
        return;
      }

      const { title } = req.body;
      const updated = await this.chatHistoryService.renameHistory(id, title);

      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  async handleDeleteHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await this.chatHistoryService.deleteHistory(id);
      sendSuccessMessage(res, 'Chat history deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
