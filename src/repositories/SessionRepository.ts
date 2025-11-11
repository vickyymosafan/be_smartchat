import { prisma } from '../infra/db/prisma';
import { Session } from '../generated/prisma';
import { CACHE_STRATEGIES } from '../infra/db/cache-config';

/**
 * Session Repository with Accelerate caching
 */
export class SessionRepository {
  private prisma = prisma;

  async create(data: {
    sessionId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Session> {
    return this.prisma.session.create({
      data,
    });
  }

  async updateActivity(sessionId: string): Promise<void> {
    await this.prisma.session.update({
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
   * Find session by ID with caching
   * Uses short cache as session data changes frequently
   */
  async findBySessionId(sessionId: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { sessionId },
      cacheStrategy: CACHE_STRATEGIES.SESSION,
    });
  }

  /**
   * Count active sessions with caching
   */
  async countActive(): Promise<number> {
    return this.prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
      cacheStrategy: CACHE_STRATEGIES.SESSION,
    });
  }

  /**
   * Find inactive sessions with caching
   */
  async findInactive(daysAgo: number = 30): Promise<Session[]> {
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    return this.prisma.session.findMany({
      where: {
        lastActivityAt: {
          gte: since,
        },
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
      take: 20,
      cacheStrategy: CACHE_STRATEGIES.SESSION,
    });
  }
}
