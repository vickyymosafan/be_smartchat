import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/ChatService';
import { chatRequestSchema } from '../schemas/chatSchemas';
import { sendSuccess } from '../utils/responseUtils';

export class ChatController {
  constructor(private chatService: ChatService) {}

  async handleChatRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedPayload = chatRequestSchema.parse(req.body);
      const response = await this.chatService.processChat(validatedPayload);
      sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  }

  async handleGetHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { sessionId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await this.chatService.getChatHistory(sessionId, limit);

      sendSuccess(res, {
        sessionId,
        messages,
        count: messages.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleHealthCheck(_req: Request, res: Response): Promise<void> {
    const uptime = process.uptime();
    const dbHealthy = await this.chatService.checkDatabaseHealth();

    sendSuccess(res, {
      uptime,
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  }
}
