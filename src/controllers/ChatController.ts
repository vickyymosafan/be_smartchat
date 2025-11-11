/**
 * Chat Controller
 * Handle HTTP request/response untuk chat endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/ChatService';
import { chatRequestSchema } from '../schemas/chatSchemas';
import { sendSuccess } from '../utils/responseUtils';

/**
 * Controller untuk menangani chat request dan health check
 * Hanya handle presentation logic, business logic ada di service
 */
export class ChatController {
  /**
   * Constructor dengan dependency injection
   * @param chatService - Service untuk handle business logic
   */
  constructor(private chatService: ChatService) {}

  /**
   * Handle POST /api/chat request
   * 
   * Flow:
   * 1. Parse request body
   * 2. Validate dengan chatRequestSchema
   * 3. Jika invalid: throw ValidationError (akan di-catch oleh error handler)
   * 4. Call chatService.forwardToN8n()
   * 5. Return success response
   * 6. Jika error: pass ke next() untuk error handler
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function untuk error handling
   */
  async handleChatRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Parse dan validate request body dengan zod
      const validatedPayload = chatRequestSchema.parse(req.body);

      // Forward ke n8n melalui service
      const n8nResponse = await this.chatService.forwardToN8n(validatedPayload);

      sendSuccess(res, n8nResponse);
    } catch (error) {
      // Pass error ke error handler middleware
      next(error);
    }
  }

  /**
   * Handle GET /api/chat/history/:sessionId request
   * 
   * Flow:
   * 1. Get sessionId dari params
   * 2. Get messages dari service
   * 3. Return messages
   * 
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function untuk error handling
   */
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

  /**
   * Handle GET /health request
   * 
   * Flow:
   * 1. Calculate uptime dengan process.uptime()
   * 2. Check database connection
   * 3. Return response dengan status 200
   * 
   * @param req - Express request object
   * @param res - Express response object
   */
  async handleHealthCheck(_req: Request, res: Response): Promise<void> {
    const uptime = process.uptime();
    const dbHealthy = await this.chatService.checkDatabaseHealth();

    sendSuccess(res, {
      uptime,
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  }
}
