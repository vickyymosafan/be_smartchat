import PrismaService from '../infra/db/prisma';

export class ChatHistoryRepository {
  private prisma = PrismaService.getClient();

  async create(data: {
    sessionId: string;
    title: string;
  }) {
    return this.prisma.chatHistory.create({
      data,
    });
  }

  async findAllWithSession() {
    return this.prisma.chatHistory.findMany({
      include: {
        session: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTitle(id: string, title: string) {
    return this.prisma.chatHistory.update({
      where: { id },
      data: { title },
    });
  }

  async delete(id: string) {
    return this.prisma.chatHistory.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.chatHistory.count({
      where: { id },
    });
    return count > 0;
  }
}
