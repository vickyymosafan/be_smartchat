import { prisma } from '../infra/db/prisma';
import { CachedResponse } from '../generated/prisma';

export class CacheRepository {
  private prisma = prisma;

  async findByHash(questionHash: string): Promise<CachedResponse | null> {
    return this.prisma.cachedResponse.findUnique({
      where: { questionHash },
    });
  }

  async create(data: {
    questionHash: string;
    question: string;
    answer: string;
    expiresAt: Date;
  }): Promise<CachedResponse> {
    return this.prisma.cachedResponse.create({ data });
  }

  async incrementHitCount(questionHash: string): Promise<void> {
    await this.prisma.cachedResponse.update({
      where: { questionHash },
      data: {
        hitCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.cachedResponse.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}
