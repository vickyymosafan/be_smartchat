import { prisma } from '../infra/db/prisma';
import { Session } from '../generated/prisma';

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

  async findBySessionId(sessionId: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { sessionId },
    });
  }

  async countActive(): Promise<number> {
    return this.prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

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
    });
  }
}
