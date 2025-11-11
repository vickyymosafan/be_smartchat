import { PrismaClient } from '../../generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';
import { logInfo, logError } from '../log/logger';

/**
 * Prisma Client Singleton with Accelerate for Serverless (Node.js Runtime)
 * 
 * Serverless Optimization:
 * - Uses --no-engine flag to reduce bundle size
 * - Prevents multiple instances across function invocations
 * - Global cache persists across hot reloads in development
 * - Accelerate handles connection pooling automatically
 * 
 * Runtime: Node.js (Vercel Serverless Functions)
 * NOT Edge Runtime - uses standard Prisma Client
 */

// Extend global type to include prisma cache
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

/**
 * Create Prisma Client instance with Accelerate extension
 * 
 * Accelerate Benefits for Serverless:
 * - Connection pooling (no cold start connection overhead)
 * - Query caching with TTL (reduces database load)
 * - Global database access (works from any region)
 * - Automatic connection management (no manual pooling needed)
 * 
 * Generated with --no-engine flag:
 * - Smaller bundle size for faster cold starts
 * - All queries go through Accelerate API
 * - No local query engine needed
 */
function createPrismaClient() {
  // Create base client for serverless
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

  logInfo('[INFO] Prisma Client with Accelerate (serverless) initialized');

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
 * 
 * Serverless Notes:
 * - Only used in bootstrap.ts for local development
 * - In serverless (Vercel), connection management is automatic
 * - Accelerate handles all connection pooling
 * - No need to manually connect/disconnect
 */
class PrismaService {
  /**
   * Connect to database
   * 
   * Local Development: Verifies database connection
   * Serverless: Not needed, Accelerate connects automatically
   * 
   * Note: This is mainly for local dev startup checks
   */
  static async connect(): Promise<void> {
    try {
      // Verify connection with simple query
      await prisma.$queryRaw`SELECT 1`;
      logInfo('Database connected successfully via Accelerate');
    } catch (error) {
      logError('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   * 
   * Local Development: Clean shutdown
   * Serverless: Not needed, connections are managed per-invocation
   * 
   * IMPORTANT: Do NOT call this in serverless functions!
   * Vercel manages function lifecycle automatically
   */
  static async disconnect(): Promise<void> {
    // In serverless, this is a no-op
    // Accelerate manages connections automatically
    logInfo('Database connection managed by Accelerate (serverless)');
  }

  /**
   * Health check - test database connection
   * Uses Accelerate caching for better performance
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
