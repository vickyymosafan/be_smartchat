/**
 * Session Policy
 * Centralized business rules for session management
 */

import { SessionRepository } from '../repositories/SessionRepository';
import { logInfo } from '../infra/log/logger';
import {
  generateSessionId,
  calculateExpiryDate,
  SESSION_EXPIRY,
} from '../utils/sessionUtils';

/**
 * Policy class for session-related business rules
 * Ensures consistent session creation across the application
 */
export class SessionPolicy {
  private sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  /**
   * Ensure session exists in database
   * If not exists, create new session with standard expiry
   * 
   * @param sessionId - Session identifier
   * @returns Internal session ID for database relations
   */
  async ensureSessionExists(sessionId: string): Promise<string> {
    const existingSession = await this.sessionRepository.findBySessionId(sessionId);
    
    if (existingSession) {
      return existingSession.id;
    }
    
    // Create new session with standard expiry
    const expiresAt = calculateExpiryDate(SESSION_EXPIRY.REGULAR_SESSION);
    const newSession = await this.sessionRepository.create({
      sessionId,
      expiresAt,
    });
    
    logInfo('New session created', { sessionId });
    return newSession.id;
  }

  /**
   * Get or create session ID
   * If provided, use it; otherwise generate new one
   * 
   * @param providedSessionId - Optional session ID
   * @returns Session ID string
   */
  getOrCreateSessionId(providedSessionId?: string): string {
    return providedSessionId || generateSessionId();
  }
}
