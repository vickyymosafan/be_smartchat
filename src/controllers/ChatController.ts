/**
 * Chat Controller
 * Handle HTTP request/response untuk chat endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/ChatService';
import { chatRequestSchema } from '../schemas/chatSchemas';

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

      // Return success response
      res.status(200).json({
        ok: true,
        data: n8nResponse,
      });
    } catch (error) {
      // Pass error ke error handler middleware
      next(error);
    }
  }

  /**
   * Handle GET /health request
   * 
   * Flow:
   * 1. Calculate uptime dengan process.uptime()
   * 2. Return response dengan status 200
   * 
   * Note: Health check tidak melakukan call ke sistem eksternal
   * 
   * @param req - Express request object
   * @param res - Express response object
   */
  async handleHealthCheck(_req: Request, res: Response): Promise<void> {
    // Calculate uptime dalam detik
    const uptime = process.uptime();

    // Return health check response
    res.status(200).json({
      ok: true,
      uptime,
    });
  }
}
