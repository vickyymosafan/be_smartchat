/**
 * Chat Service
 * Business logic untuk forward request chat ke n8n webhook
 */

import { HttpClient } from '../core/http/HttpClient';
import { ChatRequest } from '../schemas/chatSchemas';
import { config } from '../config/env';

/**
 * Service untuk menangani chat request
 * Meneruskan request ke n8n webhook dengan retry mechanism (handled by HttpClient)
 */
export class ChatService {
  /**
   * Constructor dengan dependency injection
   * @param httpClient - HTTP client untuk melakukan request (dependency inversion)
   */
  constructor(private httpClient: HttpClient) {}

  /**
   * Forward chat request ke n8n webhook
   * 
   * Flow:
   * 1. Terima validated ChatRequest payload
   * 2. Transform payload ke format n8n (message -> chatInput, tambah sessionId)
   * 3. Call httpClient.post ke N8N_WEBHOOK_URL
   * 4. Set headers dan timeout
   * 5. Return response data jika sukses (2xx)
   * 6. Throw error jika gagal
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
    try {
      // Transform payload ke format n8n AI Agent
      // N8n mengharapkan: { chatInput, sessionId }
      const n8nPayload = {
        chatInput: payload.message,
        sessionId: payload.userId || this.generateSessionId(),
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

      // Return data dari n8n jika sukses
      return response.data;
    } catch (error: any) {
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
   * Generate random session ID jika userId tidak ada
   * Format: session-{timestamp}-{random}
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `session-${timestamp}-${random}`;
  }
}
