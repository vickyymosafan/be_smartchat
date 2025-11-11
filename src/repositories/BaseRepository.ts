import { prisma } from '../infra/db/prisma';

/**
 * Base Repository
 * Provides common database access pattern for all repositories
 */
export abstract class BaseRepository {
  protected readonly prisma = prisma;
}
