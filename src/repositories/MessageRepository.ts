import { prisma } from '../infra/db/prisma';
import { Message } from '../generated/prisma';
import { CACHE_STRATEGIES } from '../infra/db/cache-config';

/**
 * Message Repository with Accelerate caching
 */
export class MessageRepository {
  private prisma = prisma;

  async create(data: {
    sessionId: string;
    role: string;
    content: string;
  }): Promise<Message> {
    return this.prisma.message.create({
      data,
    });
  }

  /**
   * Find messages by session ID with caching
   * Uses medium cache as message history is append-only
   */
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
