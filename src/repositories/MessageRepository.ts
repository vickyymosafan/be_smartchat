import PrismaService from '../infra/db/prisma';
import { Message } from '../generated/prisma';

/**
 * Repository untuk Message operations
 */
export class MessageRepository {
  private prisma = PrismaService.getClient();

  async create(data: {
    sessionId: string;
    role: string;
    content: string;
  }): Promise<Message> {
    return this.prisma.message.create({
      data,
    });
  }

  async findBySessionId(
    sessionId: string,
    limit?: number
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }
}
