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

  /**
   * Get recent messages by session
   */
  async findRecentBySessionId(
    sessionId: string,
    limit: number = 10
  ): Promise<Message[]> {
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Delete messages by session
   */
  async deleteBySessionId(sessionId: string): Promise<number> {
    const result = await prisma.message.deleteMany({
      where: { sessionId },
    });
    return result.count;
  }

  /**
   * Count messages by session
   */
  async countBySessionId(sessionId: string): Promise<number> {
    return prisma.message.count({
      where: { sessionId },
    });
  }
}
