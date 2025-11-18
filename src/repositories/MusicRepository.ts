import { prisma } from '../infra/db/prisma';
import { BackgroundMusic } from '../generated/prisma';

export class MusicRepository {
  private prisma = prisma;

  async findAllActive(): Promise<BackgroundMusic[]> {
    return this.prisma.backgroundMusic.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string): Promise<BackgroundMusic | null> {
    return this.prisma.backgroundMusic.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    artist?: string;
    url: string;
    order?: number;
  }): Promise<BackgroundMusic> {
    return this.prisma.backgroundMusic.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      artist: string;
      url: string;
      isActive: boolean;
      order: number;
    }>
  ): Promise<BackgroundMusic> {
    return this.prisma.backgroundMusic.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.backgroundMusic.delete({
      where: { id },
    });
  }
}
