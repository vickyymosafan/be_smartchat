import { SessionRepository } from '../repositories/SessionRepository';
import { logInfo, logError } from '../infra/log/logger';
import { calculateExpiryDate, SESSION_EXPIRY } from '../utils/sessionUtils';

export class SessionService {
  private sessionRepository: SessionRepository;

  constructor(sessionRepository?: SessionRepository) {
    this.sessionRepository = sessionRepository || new SessionRepository();
  }

  async ensureSessionExists(sessionId: string): Promise<string> {
    const existingSession = await this.sessionRepository.findBySessionId(sessionId);
    
    if (existingSession) {
      return existingSession.id;
    }
    
    const expiresAt = calculateExpiryDate(SESSION_EXPIRY.REGULAR_SESSION);
    const newSession = await this.sessionRepository.create({
      sessionId,
      expiresAt,
    });
    
    logInfo('New session created', { sessionId });
    return newSession.id;
  }

  async findBySessionId(sessionId: string) {
    return this.sessionRepository.findBySessionId(sessionId);
  }

  async updateActivity(sessionId: string): Promise<void> {
    return this.sessionRepository.updateActivity(sessionId);
  }

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
