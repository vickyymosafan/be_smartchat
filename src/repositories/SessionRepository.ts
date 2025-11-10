import { prisma } from '../infra/db/prisma';
import { Session } from '../generated/prisma';

/**
 * Repository untuk Session operations
 * Menggunakan Repository Pattern untuk abstraksi database operations
 */
export class SessionRepository {
  /**
   * Create new session
   * Sessions are anonymous (no user association)
   */
  async create(data: {
    sessionId: string;
    token?: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Session> {
    return prisma.session.create({
      data,
    });
  }

  /**
   * Update session activity
   * Called on each message to track last activity
   */
  async updateActivity(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { sessionId },
      data: {
        lastActivityAt: new Date(),
        messageCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get inactive sessions (no activity for N days)
   */
  async findInactive(daysAgo: number = 30): Promise<Session[]> {
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    return prisma.session.findMany({
      where: {
        lastActivityAt: {
          lt: since,
        },
      },
    });
  }

  /**
   * Delete inactive sessions
   */
  async deleteInactive(daysAgo: number = 30): Promise<number> {
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const result = await prisma.session.deleteMany({
      where: {
        lastActivityAt: {
          lt: since,
        },
      },
    });
    
    return result.count;
  }

  /**
   * Find session by token
   */
  async findByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { token },
    });
  }

  /**
   * Find session by internal ID
   */
  async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  /**
   * Find session by sessionId
   */
  async findBySessionId(sessionId: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { sessionId },
    });
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Delete session by token
   */
  async deleteByToken(token: string): Promise<void> {
    await prisma.session.delete({
      where: { token },
    });
  }

  /**
   * Count active sessions
   */
  async countActive(): Promise<number> {
    return prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }
}
