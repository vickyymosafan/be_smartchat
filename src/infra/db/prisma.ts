import { PrismaClient } from '../../generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';
import { logInfo, logError } from '../log/logger';

/**
 * Prisma Client Singleton with Accelerate for Serverless
 * Uses --no-engine flag for edge runtime compatibility
 * Prevents multiple instances in serverless environments (Vercel, AWS Lambda)
 * Uses global cache to persist across hot reloads in development
 * Accelerate provides connection pooling and query caching
 */

// Extend global type to include prisma cache
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

/**
 * Create Prisma Client instance with Accelerate extension
 * Generated with --no-engine flag for edge runtime
 * Accelerate provides:
 * - Connection pooling for serverless
 * - Query caching with TTL
 * - Global database access
 * - Edge runtime compatibility
 */
function createPrismaClient() {
  // Create base client without engine (edge-compatible)
  const baseClient = new PrismaClient({
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

  // Log errors
  baseClient.$on('error' as never, (e: any) => {
    logError('Prisma Error', e);
  });

  // Log warnings
  baseClient.$on('warn' as never, (e: any) => {
    logError('Prisma Warning', e);
  });

  logInfo('[INFO] Prisma Client with Accelerate (edge) initialized');

  // Return extended client with Accelerate
  return baseClient.$extends(withAccelerate());
}

/**
 * Global Prisma Client instance with Accelerate
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
 * Note: With Accelerate, connection management is handled automatically
 */
class PrismaService {
  /**
   * Connect to database
   * Note: With Accelerate, connection is managed automatically
   * This method is kept for compatibility but does nothing in Accelerate mode
   */
  static async connect(): Promise<void> {
    try {
      // Accelerate manages connections automatically
      // Just verify we can query
      await prisma.$queryRaw`SELECT 1`;
      logInfo('Database connected successfully via Accelerate');
    } catch (error) {
      logError('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   * Important: With Accelerate, disconnection is not needed
   * Kept for compatibility but does nothing
   */
  static async disconnect(): Promise<void> {
    // Accelerate manages connections automatically
    // No need to disconnect
    logInfo('Database connection managed by Accelerate');
  }

  /**
   * Health check - test database connection with caching
   */
  static async healthCheck(): Promise<boolean> {
    try {
      // Use Accelerate caching for health check (5 second TTL)
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logError('Database health check failed', error);
      return false;
    }
  }
}

export default PrismaService;
