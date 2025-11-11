import { ChatHistoryRepository } from '../repositories/ChatHistoryRepository';
import { logInfo, logError } from '../infra/log/logger';
import { SessionService } from './SessionService';
import { generateTitleFromText, validateTitle } from '../utils/textUtils';
import { checkResourceExists } from '../policies/ResourceExistencePolicy';

export class ChatHistoryService {
  private chatHistoryRepository: ChatHistoryRepository;
  private sessionService: SessionService;

  constructor(
    chatHistoryRepository?: ChatHistoryRepository,
    sessionService?: SessionService
  ) {
    this.chatHistoryRepository = chatHistoryRepository || new ChatHistoryRepository();
    this.sessionService = sessionService || new SessionService();
  }

  async createFromMessage(sessionId: string, firstMessage: string) {
    try {
      const sessionInternalId = await this.sessionService.ensureSessionExists(sessionId);
      const title = generateTitleFromText(firstMessage);

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

  async getAllHistories() {
    try {
      const histories = await this.chatHistoryRepository.findAllWithSession();
      
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

  async renameHistory(id: string, newTitle: string) {
    try {
      const validation = validateTitle(newTitle);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      await checkResourceExists(
        () => this.chatHistoryRepository.exists(id),
        'Chat history',
        id
      );

      const updated = await this.chatHistoryRepository.updateTitle(id, newTitle.trim());
      logInfo('Chat history renamed', { historyId: id, newTitle });
      return updated;
    } catch (error) {
      logError('Failed to rename chat history', error);
      throw error;
    }
  }

  async deleteHistory(id: string) {
    try {
      await checkResourceExists(
        () => this.chatHistoryRepository.exists(id),
        'Chat history',
        id
      );

      await this.chatHistoryRepository.delete(id);
      logInfo('Chat history deleted', { historyId: id });
      return { success: true };
    } catch (error) {
      logError('Failed to delete chat history', error);
      throw error;
    }
  }
}
