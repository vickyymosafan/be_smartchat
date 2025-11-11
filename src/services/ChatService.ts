import { HttpClient } from '../core/http/HttpClient';
import { ChatRequest } from '../schemas/chatSchemas';
import { config } from '../config/env';
import { MessageRepository } from '../repositories/MessageRepository';
import { logInfo, logError } from '../infra/log/logger';
import { generateSessionId } from '../utils/sessionUtils';
import { SessionService } from './SessionService';

export class ChatService {
  private messageRepository: MessageRepository;
  private sessionService: SessionService;

  constructor(
    private httpClient: HttpClient,
    messageRepository?: MessageRepository,
    sessionService?: SessionService
  ) {
    this.messageRepository = messageRepository || new MessageRepository();
    this.sessionService = sessionService || new SessionService();
  }

  async forwardToN8n(payload: ChatRequest): Promise<any> {
    const sessionId = payload.userId || generateSessionId();

    try {
      const sessionInternalId = await this.sessionService.ensureSessionExists(sessionId);

      await this.messageRepository.create({
        sessionId: sessionInternalId,
        role: 'user',
        content: payload.message,
      });

      await this.sessionService.updateActivity(sessionId);
      logInfo('User message saved', { sessionId, messageLength: payload.message.length });

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
      await this.messageRepository.create({
        sessionId: sessionInternalId,
        role: 'assistant',
        content: assistantMessage,
      });

      logInfo('Assistant response saved', { sessionId, responseLength: assistantMessage.length });
      return response.data;
    } catch (error: any) {
      logError('Failed to forward to n8n', error);
      throw new Error(
        `Gagal meneruskan request ke n8n: ${error.message || 'Unknown error'} (Status: ${error.status || 'N/A'})`
      );
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
