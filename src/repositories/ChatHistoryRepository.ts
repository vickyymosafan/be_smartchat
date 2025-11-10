/**
 * ChatHistory Repository
 * Data access layer untuk chat history operations
 */

import PrismaService from '../infra/db/prisma';

export class ChatHistoryRepository {
  private prisma = PrismaService.getClient();

  /**
   * Create new chat history entry
   */
  async create(data: {
    sessionId: string;
    title: string;
  }) {
    return this.prisma.chatHistory.create({
      data,
    });
  }

  /**
   * Get all chat histories with session data (optimized with join)
   * Avoids N+1 query problem
   */
  async findAllWithSession() {
    return this.prisma.chatHistory.findMany({
      include: {
        session: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update chat history title (rename)
   */
  async updateTitle(id: string, title: string) {
    return this.prisma.chatHistory.update({
      where: { id },
      data: { title },
    });
  }

  /**
   * Delete chat history
   */
  async delete(id: string) {
    return this.prisma.chatHistory.delete({
      where: { id },
    });
  }

  /**
   * Check if history exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.chatHistory.count({
      where: { id },
    });
    return count > 0;
  }
}
