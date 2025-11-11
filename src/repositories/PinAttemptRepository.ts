import PrismaService from '../infra/db/prisma';
import { PinAttempt } from '../generated/prisma';

/**
 * Repository untuk PIN Attempt operations
 * Track PIN verification attempts untuk security
 */
export class PinAttemptRepository {
  private prisma = PrismaService.getClient();

  /**
   * Record PIN attempt
   */
  async create(data: {
    ipAddress: string;
    success: boolean;
  }): Promise<PinAttempt> {
    return this.prisma.pinAttempt.create({
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
    
    return this.prisma.pinAttempt.count({
      where: {
        ipAddress,
        success: false,
        attemptAt: {
          gte: since,
        },
      },
    });
  }
}
