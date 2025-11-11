import { SessionRepository } from '../repositories/SessionRepository';

export class DashboardService {
  private sessionRepository: SessionRepository;

  constructor(sessionRepository?: SessionRepository) {
    this.sessionRepository = sessionRepository || new SessionRepository();
  }

  async getStatistics() {
    const activeSessions = await this.sessionRepository.countActive();

    return {
      totalSessions: activeSessions,
      activeSessions,
      totalMessages: 0, // Placeholder - not implemented
    };
  }

  async getRecentActivity() {
    // Return empty activity for now (no authentication tracking)
    return [];
  }

  async getActiveSessions() {
    // Get recent sessions (last 30 days) as proxy for "active"
    const sessions = await this.sessionRepository.findInactive(30);

    return sessions.map((session) => ({
      sessionId: session.sessionId,
      ipAddress: session.ipAddress,
      messageCount: 0, // Placeholder - not implemented
      lastActivityAt: session.lastActivityAt,
    }));
  }
}
