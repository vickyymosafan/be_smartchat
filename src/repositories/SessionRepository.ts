import PrismaService from '../infra/db/prisma';
import { Session } from '../generated/prisma';

/**
 * Repository untuk Session operations
 * Menggunakan Repository Pattern untuk abstraksi database operations
 */
export class SessionRepository {
  private prisma = PrismaService.getClient();
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
    return this.prisma.session.create({
      data,
    });
  }

  /**
   * Update session activity
   * Called on each message to track last activity
   */
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
   * Find session by token
   */
  async findByToken(token: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { token },
    });
  }

  /**
   * Find session by sessionId
   */
  async findBySessionId(sessionId: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { sessionId },
    });
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
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
    await this.prisma.session.delete({
      where: { token },
    });
  }

  /**
   * Count active sessions
   */
  async countActive(): Promise<number> {
    return this.prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }
}
