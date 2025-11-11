import { PrismaClient } from '../../generated/prisma';
import { logInfo, logError } from '../log/logger';

/**
 * Prisma Client Singleton
 * Menggunakan singleton pattern untuk menghindari multiple instances
 */
class PrismaService {
  private static instance: PrismaClient | null = null;

  /**
   * Get Prisma Client instance
   * Lazy initialization - hanya create instance saat pertama kali dibutuhkan
   */
  static getClient(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'event' },
          { level: 'warn', emit: 'event' },
        ],
      });

      // Log queries di development
      if (process.env.NODE_ENV === 'development') {
        PrismaService.instance.$on('query' as never, (e: any) => {
          logInfo('Prisma Query', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
          });
        });
      }

      // Log errors
      PrismaService.instance.$on('error' as never, (e: any) => {
        logError('Prisma Error', e);
      });

      logInfo('Prisma Client initialized');
    }

    return PrismaService.instance;
  }

  /**
   * Connect to database
   * Explicit connection - useful untuk testing atau startup checks
   */
  static async connect(): Promise<void> {
    try {
      const client = PrismaService.getClient();
      await client.$connect();
      logInfo('Database connected successfully');
    } catch (error) {
      logError('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   * Cleanup saat aplikasi shutdown
   */
  static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
      PrismaService.instance = null;
      logInfo('Database disconnected');
    }
  }

  /**
   * Health check - test database connection
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const client = PrismaService.getClient();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logError('Database health check failed', error);
      return false;
    }
  }
}

export default PrismaService;
