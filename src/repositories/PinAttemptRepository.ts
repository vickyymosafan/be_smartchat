import PrismaService from '../infra/db/prisma';
import { PinAttempt } from '../generated/prisma';

export class PinAttemptRepository {
  private prisma = PrismaService.getClient();

  async create(data: {
    ipAddress: string;
    success: boolean;
  }): Promise<PinAttempt> {
    return this.prisma.pinAttempt.create({
      data,
    });
  }

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
