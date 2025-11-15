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
    const sessionId = payload.sessionId || generateSessionId();
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
      logInfo('Forwarding to N8N', { 
        url: config.N8N_WEBHOOK_URL,
        sessionId,
        messageLength: payload.message.length 
      });

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

      logInfo('N8N response received', { 
        status: response.status,
        hasData: !!response.data 
      });

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
        stack: error.stack,
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
    logInfo('getChatHistory called', { 
      userFacingSessionId: sessionId, 
      limit 
    });
    
    const session = await this.sessionService.findBySessionId(sessionId);
    
    if (!session) {
      logInfo('Session not found for history', { 
        userFacingSessionId: sessionId 
      });
      return [];
    }
    
    logInfo('Session found', { 
      userFacingSessionId: sessionId,
      internalSessionId: session.id,
      messageCount: session.messageCount 
    });
    
    const messages = await this.messageRepository.findBySessionId(session.id, limit);
    
    logInfo('Messages retrieved', { 
      userFacingSessionId: sessionId,
      internalSessionId: session.id,
      messagesFound: messages.length,
      expectedCount: session.messageCount 
    });
    
    return messages;
  }

  async checkDatabaseHealth(): Promise<boolean> {
    return this.sessionService.checkDatabaseHealth();
  }
}
