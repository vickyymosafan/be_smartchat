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
   * Takes first 50 characters or first sentence
   */
  private generateTitle(message: string): string {
    // Remove extra whitespace
    const cleaned = message.trim().replace(/\s+/g, ' ');
    
    // Try to get first sentence (up to first period, question mark, or exclamation)
    const firstSentence = cleaned.match(/^[^.!?]+[.!?]?/)?.[0] || cleaned;
    
    // Limit to 50 characters
    if (firstSentence.length > 50) {
      return firstSentence.substring(0, 47) + '...';
    }
    
    return firstSentence;
  }

  /**
   * Create chat history from first message
   */
  async createFromMessage(sessionId: string, firstMessage: string) {
    try {
      // Get or create session
      let session = await this.sessionRepository.findBySessionId(sessionId);
      
      if (!session) {
        // Create new session if not exists
        const expiresAt = calculateExpiryDate(SESSION_EXPIRY.REGULAR_SESSION);
        session = await this.sessionRepository.create({
          sessionId,
          expiresAt,
        });
        logInfo('New session created for chat history', { sessionId });
      }

      // Generate title from first message
      const title = this.generateTitle(firstMessage);

      // Create chat history
      const history = await this.chatHistoryRepository.create({
        sessionId: session.id,
        title,
      });

      logInfo('Chat history created', { historyId: history.id, sessionId, title });
      
      // Return history with actual sessionId string
      return {
        ...history,
        sessionId: session.sessionId,
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
      // Validate title
      if (!newTitle || newTitle.trim().length === 0) {
        throw new Error('Title cannot be empty');
      }

      if (newTitle.length > 100) {
        throw new Error('Title too long (max 100 characters)');
      }

      // Check if history exists
      const exists = await this.chatHistoryRepository.exists(id);
      if (!exists) {
        throw new Error('Chat history not found');
      }

      // Update title
      const updated = await this.chatHistoryRepository.updateTitle(id, newTitle.trim());
      logInfo('Chat history renamed', { historyId: id, newTitle });
      return updated;
    } catch (error) {
      logError('Failed to rename chat history', error);
      throw error;
    }
  }

  /**
   * Delete chat history
   */
  async deleteHistory(id: string) {
    try {
      // Check if history exists
      const exists = await this.chatHistoryRepository.exists(id);
      if (!exists) {
        throw new Error('Chat history not found');
      }

      // Delete history
      await this.chatHistoryRepository.delete(id);
      logInfo('Chat history deleted', { historyId: id });
      return { success: true };
    } catch (error) {
      logError('Failed to delete chat history', error);
      throw error;
    }
  }
}
