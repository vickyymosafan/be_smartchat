/**
 * ChatHistory Service
 * Business logic untuk chat history management
 */

import { ChatHistoryRepository } from '../repositories/ChatHistoryRepository';
import { SessionPolicy } from '../policies/SessionPolicy';
import { logInfo, logError } from '../infra/log/logger';
import { generateTitle, validateTitle } from '../utils/textUtils';

export class ChatHistoryService {
  private chatHistoryRepository: ChatHistoryRepository;
  private sessionPolicy: SessionPolicy;

  constructor() {
    this.chatHistoryRepository = new ChatHistoryRepository();
    this.sessionPolicy = new SessionPolicy();
  }

  /**
   * Create chat history from first message
   */
  async createFromMessage(sessionId: string, firstMessage: string) {
    try {
      // Ensure session exists and get internal ID
      const sessionInternalId = await this.sessionPolicy.ensureSessionExists(sessionId);

      // Generate title from first message
      const title = generateTitle(firstMessage);

      // Create chat history
      const history = await this.chatHistoryRepository.create({
        sessionId: sessionInternalId,
        title,
      });

      logInfo('Chat history created', { historyId: history.id, sessionId, title });
      
      // Return history with actual sessionId string
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
      // Validate title
      const validation = validateTitle(newTitle);
      if (!validation.valid) {
        throw new Error(validation.error);
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
