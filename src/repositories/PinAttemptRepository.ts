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

  async findRecentByIp(
    ipAddress: string,
    limit: number = 10
  ): Promise<PinAttempt[]> {
    const where = ipAddress ? { ipAddress } : {};
    
    return this.prisma.pinAttempt.findMany({
      where,
      orderBy: {
        attemptAt: 'desc',
      },
      take: limit,
    });
  }
}
