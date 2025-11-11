import { PrismaClient } from '../../generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';
import { logInfo, logError } from '../log/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const baseClient = new PrismaClient({
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  baseClient.$on('error' as never, (e: any) => {
    logError('Prisma Error', e);
  });

  baseClient.$on('warn' as never, (e: any) => {
    logError('Prisma Warning', e);
  });

  logInfo('[INFO] Prisma Client with Accelerate (serverless) initialized');

  return baseClient.$extends(withAccelerate());
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

class PrismaService {
  static async connect(): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logInfo('Database connected successfully via Accelerate');
    } catch (error) {
      logError('Failed to connect to database', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    logInfo('Database connection managed by Accelerate (serverless)');
  }

  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logError('Database health check failed', error);
      return false;
    }
  }
}

export default PrismaService;
