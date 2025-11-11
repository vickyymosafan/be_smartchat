import { prisma } from '../infra/db/prisma';
import { CACHE_STRATEGIES } from '../infra/db/cache-config';

export class ChatHistoryRepository {
  private prisma = prisma;

  async create(data: { sessionId: string; title: string }) {
    return this.prisma.chatHistory.create({ data });
  }

  async findAllWithSession() {
    return this.prisma.chatHistory.findMany({
      include: { session: true },
      orderBy: { createdAt: 'desc' },
      cacheStrategy: CACHE_STRATEGIES.CHAT_HISTORY,
    });
  }

  async updateTitle(id: string, title: string) {
    return this.prisma.chatHistory.update({
      where: { id },
      data: { title },
    });
  }

  async delete(id: string) {
    return this.prisma.chatHistory.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.chatHistory.count({
      where: { id },
      cacheStrategy: CACHE_STRATEGIES.CHAT_HISTORY,
    });
    return count > 0;
  }
}
