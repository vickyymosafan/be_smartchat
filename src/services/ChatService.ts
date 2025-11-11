/**
 * Chat Service
 * Business logic untuk forward request chat ke n8n webhook
 * Menyimpan chat history ke database
 */

import { HttpClient } from '../core/http/HttpClient';
import { ChatRequest } from '../schemas/chatSchemas';
import { config } from '../config/env';
import { MessageRepository } from '../repositories/MessageRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { SessionPolicy } from '../policies/SessionPolicy';
import { logInfo, logError } from '../infra/log/logger';

/**
 * Service untuk menangani chat request
 * Meneruskan request ke n8n webhook dengan retry mechanism (handled by HttpClient)
 */
export class ChatService {
  private messageRepository: MessageRepository;
  private sessionRepository: SessionRepository;
  private sessionPolicy: SessionPolicy;

  /**
   * Constructor dengan dependency injection
   * @param httpClient - HTTP client untuk melakukan request (dependency inversion)
   */
  constructor(private httpClient: HttpClient) {
    this.messageRepository = new MessageRepository();
    this.sessionRepository = new SessionRepository();
    this.sessionPolicy = new SessionPolicy();
  }

  /**
   * Forward chat request ke n8n webhook
   * 
   * Flow:
   * 1. Terima validated ChatRequest payload
   * 2. Ensure session exists di database
   * 3. Save user message ke database
   * 4. Transform payload ke format n8n (message -> chatInput, tambah sessionId)
   * 5. Call httpClient.post ke N8N_WEBHOOK_URL
   * 6. Save assistant response ke database
   * 7. Return response data jika sukses (2xx)
   * 8. Throw error jika gagal
   * 
   * Error Handling:
   * - Network errors: akan di-retry oleh HttpClient (max 2x)
   * - 5xx errors: akan di-retry oleh HttpClient (max 2x)
   * - 4xx errors: throw immediately (tidak retry)
   * - Timeout: throw dengan pesan jelas
   * 
   * @param payload - Validated chat request payload
   * @returns Response data dari n8n
   * @throws Error jika request gagal setelah retry
   */
  async forwardToN8n(payload: ChatRequest): Promise<any> {
    const sessionId = this.sessionPolicy.getOrCreateSessionId(payload.userId);

    try {
      // Ensure session exists di database and get internal ID
      const sessionInternalId = await this.sessionPolicy.ensureSessionExists(sessionId);

      // Save user message ke database (using internal session ID)
      await this.messageRepository.create({
        sessionId: sessionInternalId,
        role: 'user',
        content: payload.message,
      });

      // Update session activity (using sessionId string)
      await this.sessionRepository.updateActivity(sessionId);

      logInfo('User message saved', { sessionId, messageLength: payload.message.length });

      // Transform payload ke format n8n AI Agent
      // N8n mengharapkan: { chatInput, sessionId }
      const n8nPayload = {
        chatInput: payload.message,
        sessionId,
      };

      // Call n8n webhook dengan HttpClient
      const response = await this.httpClient.post(
        config.N8N_WEBHOOK_URL,
        n8nPayload,
        {
          timeout: config.N8N_TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Save assistant response ke database (using internal session ID)
      const assistantMessage = response.data?.output || response.data?.message || JSON.stringify(response.data);
      await this.messageRepository.create({
        sessionId: sessionInternalId,
        role: 'assistant',
        content: assistantMessage,
      });

      logInfo('Assistant response saved', { sessionId, responseLength: assistantMessage.length });

      // Return data dari n8n jika sukses
      return response.data;
    } catch (error: any) {
      // Log error
      logError('Failed to forward to n8n', error);

      // Wrap error dengan context untuk debugging
      const errorMessage = error.message || 'Unknown error';
      const errorStatus = error.status || 'N/A';
      
      // Throw error dengan context yang jelas
      throw new Error(
        `Gagal meneruskan request ke n8n: ${errorMessage} (Status: ${errorStatus})`
      );
    }
  }

  /**
   * Get chat history untuk session tertentu
   * 
   * @param sessionId - Session ID (string identifier, not internal ID)
   * @param limit - Optional limit jumlah messages
   * @returns Array of messages
   */
  async getChatHistory(sessionId: string, limit?: number): Promise<any[]> {
    // Find session by sessionId string to get internal ID
    const session = await this.sessionRepository.findBySessionId(sessionId);
    
    if (!session) {
      logInfo('Session not found for history', { sessionId });
      return [];
    }
    
    // Use internal session ID to query messages
    const messages = await this.messageRepository.findBySessionId(session.id, limit);
    return messages;
  }

  /**
   * Check database health
   * 
   * @returns true jika database connected, false jika tidak
   */
  async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.sessionRepository.countActive();
      return true;
    } catch (error) {
      logError('Database health check failed', error);
      return false;
    }
  }

}
