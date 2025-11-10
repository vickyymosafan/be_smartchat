import { prisma } from '../infra/db/prisma';
import { Message } from '../generated/prisma';

/**
 * Repository untuk Message operations
 */
export class MessageRepository {
  /**
   * Create new message
   */
  async create(data: {
    sessionId: string;
    role: string;
    content: string;
  }): Promise<Message> {
    return prisma.message.create({
      data,
    });
  }

  /**
   * Get messages by session
   */
  async findBySessionId(
    sessionId: string,
    limit?: number
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }


}
