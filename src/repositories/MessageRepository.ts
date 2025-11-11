import { prisma } from '../infra/db/prisma';
import { Message } from '../generated/prisma';
import { CACHE_STRATEGIES } from '../infra/db/cache-config';

export class MessageRepository {
  private prisma = prisma;

  async create(data: {
    sessionId: string;
    role: string;
    content: string;
  }): Promise<Message> {
    return this.prisma.message.create({ data });
  }

  async findBySessionId(
    sessionId: string,
    limit?: number
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      cacheStrategy: CACHE_STRATEGIES.MESSAGES,
    });
  }
}
