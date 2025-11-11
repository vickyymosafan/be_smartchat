import { HttpClient } from '../core/http/HttpClient';
import { ChatRequest } from '../schemas/chatSchemas';
import { config } from '../config/env';
import { MessageRepository } from '../repositories/MessageRepository';
import { logInfo, logError } from '../infra/log/logger';
import { generateSessionId } from '../utils/sessionUtils';
import { SessionService } from './SessionService';

export class ChatService {
  private messageRepository = new MessageRepository();
  private sessionService = new SessionService();

  constructor(private httpClient: HttpClient) {}

  async forwardToN8n(payload: ChatRequest): Promise<any> {
    const sessionId = payload.userId || generateSessionId();
    let sessionInternalId: string;

    try {
      sessionInternalId = await this.sessionService.ensureSessionExists(sessionId);

      await this.messageRepository.create({
        sessionId: sessionInternalId,
        role: 'user',
        content: payload.message,
      });

      await this.sessionService.updateActivity(sessionId);
      logInfo('User message saved', { sessionId, messageLength: payload.message.length });
    } catch (dbError: any) {
      logError('Database error while saving user message', dbError);
      throw new Error('Gagal menyimpan pesan ke database');
    }

    try {
      const response = await this.httpClient.post(
        config.N8N_WEBHOOK_URL,
        {
          chatInput: payload.message,
          sessionId,
        },
        {
          timeout: config.N8N_TIMEOUT_MS,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const assistantMessage = response.data?.output || response.data?.message || JSON.stringify(response.data);
      
      try {
        await this.messageRepository.create({
          sessionId: sessionInternalId,
          role: 'assistant',
          content: assistantMessage,
        });
        logInfo('Assistant response saved', { sessionId, responseLength: assistantMessage.length });
      } catch (dbError: any) {
        logError('Failed to save assistant response to database', dbError);
      }

      return response.data;
    } catch (error: any) {
      logError('Failed to forward to n8n', {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      const errorMessage = error.code === 'ECONNREFUSED'
        ? 'Tidak dapat terhubung ke AI service. Silakan coba lagi nanti.'
        : error.status === 502
        ? 'AI service sedang sibuk. Silakan coba lagi.'
        : error.status === 504
        ? 'AI service timeout. Silakan coba lagi dengan pertanyaan yang lebih singkat.'
        : `Terjadi kesalahan: ${error.message || 'Unknown error'}`;

      throw new Error(errorMessage);
    }
  }

  async getChatHistory(sessionId: string, limit?: number): Promise<any[]> {
    const session = await this.sessionService.findBySessionId(sessionId);
    
    if (!session) {
      logInfo('Session not found for history', { sessionId });
      return [];
    }
    
    return this.messageRepository.findBySessionId(session.id, limit);
  }

  async checkDatabaseHealth(): Promise<boolean> {
    return this.sessionService.checkDatabaseHealth();
  }
}
