import { prisma } from '../infra/db/prisma';
import { PinAttempt } from '../generated/prisma';

/**
 * Repository untuk PIN Attempt operations
 * Track PIN verification attempts untuk security
 */
export class PinAttemptRepository {
  /**
   * Record PIN attempt
   */
  async create(data: {
    ipAddress: string;
    success: boolean;
  }): Promise<PinAttempt> {
    return prisma.pinAttempt.create({
      data,
    });
  }

  /**
   * Get failed attempts count for IP in last N minutes
   */
  async countFailedAttempts(
    ipAddress: string,
    minutesAgo: number = 15
  ): Promise<number> {
    const since = new Date(Date.now() - minutesAgo * 60 * 1000);
    
    return prisma.pinAttempt.count({
      where: {
        ipAddress,
        success: false,
        attemptAt: {
          gte: since,
        },
      },
    });
  }

  /**
   * Delete old attempts (cleanup)
   */
  async deleteOlderThan(daysAgo: number = 30): Promise<number> {
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const result = await prisma.pinAttempt.deleteMany({
      where: {
        attemptAt: {
          lt: since,
        },
      },
    });
    
    return result.count;
  }

  /**
   * Get recent attempts for IP
   */
  async findRecentByIp(
    ipAddress: string,
    limit: number = 10
  ): Promise<PinAttempt[]> {
    return prisma.pinAttempt.findMany({
      where: { ipAddress },
      orderBy: { attemptAt: 'desc' },
      take: limit,
    });
  }
}
