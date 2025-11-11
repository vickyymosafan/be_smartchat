/**
 * ChatHistory Service
 * Business logic untuk chat history management
 */

import { ChatHistoryRepository } from '../repositories/ChatHistoryRepository';
import { SessionRepository } from '../repositories/SessionRepository';
import { logInfo, logError } from '../infra/log/logger';
import { calculateExpiryDate, SESSION_EXPIRY } from '../utils/sessionUtils';

export class ChatHistoryService {
  private chatHistoryRepository: ChatHistoryRepository;
  private sessionRepository: SessionRepository;

  constructor() {
    this.chatHistoryRepository = new ChatHistoryRepository();
    this.sessionRepository = new SessionRepository();
  }

  /**
   * Generate title from first message
   */
  private generateTitle(text: string): string {
    const cleaned = text.trim().replace(/\s+/g, ' ');
    const firstSentence = cleaned.match(/^[^.!?]+[.!?]?/)?.[0] || cleaned;
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence;
  }

  /**
   * Validate title
   */
  private validateTitle(title: string): { valid: boolean; error?: string } {
    if (!title || title.trim().length === 0) {
      return { valid: false, error: 'Title cannot be empty' };
    }
    if (title.length > 100) {
      return { valid: false, error: 'Title too long (max 100 characters)' };
    }
    return { valid: true };
  }

  /**
   * Create chat history from first message
   */
  async createFromMessage(sessionId: string, firstMessage: string) {
    try {
      const sessionInternalId = await this.ensureSessionExists(sessionId);
      const title = this.generateTitle(firstMessage);

      const history = await this.chatHistoryRepository.create({
        sessionId: sessionInternalId,
        title,
      });

      logInfo('Chat history created', { historyId: history.id, sessionId, title });
      
      return {
        ...history,
        sessionId,
      };
    } catch (error) {
      logError('Failed to create chat history', error);
      throw error;
    }
  }

  /**
   * Get all chat histories (across all sessions for single-user app)
   * Optimized to avoid N+1 query problem
   */
  async getAllHistories() {
    try {
      const histories = await this.chatHistoryRepository.findAllWithSession();
      
      // Map histories to include actual sessionId string instead of internal ID
      return histories.map(history => ({
        id: history.id,
        sessionId: history.session.sessionId,
        title: history.title,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      }));
    } catch (error) {
      logError('Failed to get all chat histories', error);
      throw error;
    }
  }

  /**
   * Rename chat history
   */
  async renameHistory(id: string, newTitle: string) {
    try {
      const validation = this.validateTitle(newTitle);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const exists = await this.chatHistoryRepository.exists(id);
      if (!exists) {
        throw new Error('Chat history not found');
      }

      const updated = await this.chatHistoryRepository.updateTitle(id, newTitle.trim());
      logInfo('Chat history renamed', { historyId: id, newTitle });
      return updated;
    } catch (error) {
      logError('Failed to rename chat history', error);
      throw error;
    }
  }

  /**
   * Ensure session exists in database
   */
  private async ensureSessionExists(sessionId: string): Promise<string> {
    const existingSession = await this.sessionRepository.findBySessionId(sessionId);
    
    if (existingSession) {
      return existingSession.id;
    }
    
    const expiresAt = calculateExpiryDate(SESSION_EXPIRY.REGULAR_SESSION);
    const newSession = await this.sessionRepository.create({
      sessionId,
      expiresAt,
    });
    
    logInfo('New session created for chat history', { sessionId });
    return newSession.id;
  }

  /**
   * Delete chat history
   */
  async deleteHistory(id: string) {
    try {
      const exists = await this.chatHistoryRepository.exists(id);
      if (!exists) {
        throw new Error('Chat history not found');
      }

      await this.chatHistoryRepository.delete(id);
      logInfo('Chat history deleted', { historyId: id });
      return { success: true };
    } catch (error) {
      logError('Failed to delete chat history', error);
      throw error;
    }
  }
}
