import { PrismaClient } from '../../generated/prisma';
import { logInfo, logError } from '../log/logger';

/**
 * Prisma Client Singleton for Serverless
 * Prevents multiple instances in serverless environments (Vercel, AWS Lambda)
 * Uses global cache to persist across hot reloads in development
 */

// Extend global type to include prisma cache
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create Prisma Client instance
 * Only logs errors and warnings to reduce overhead
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Log errors
  client.$on('error' as never, (e: any) => {
    logError('Prisma Error', e);
  });

  // Log warnings
  client.$on('warn' as never, (e: any) => {
    logError('Prisma Warning', e);
  });

  logInfo('[INFO] Prisma Client initialized');

  return client;
}

/**
 * Global Prisma Client instance
 * Reuses existing instance in development (hot reload)
 * Creates new instance in production
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache instance in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Prisma Service - Utility methods for database operations
 * Only used in bootstrap.ts for local development
 */
class PrismaService {
  /**
   * Connect to database
   * Note: Prisma connects automatically on first query
   * This method is for explicit connection (e.g., startup checks in local dev)
   */
  static async connect(): Promise<void> {
    try {
      await prisma.$connect();
      logInfo('Database connected successfully');
    } catch (error) {
      logError('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   * Important: Only call this on app shutdown in local dev, NOT in serverless
   */
  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
    logInfo('Database disconnected');
  }

  /**
   * Health check - test database connection
   */
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
