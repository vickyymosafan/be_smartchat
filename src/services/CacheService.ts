import { CacheRepository } from '../repositories/CacheRepository';
import { generateQuestionHash } from '../utils/hashUtils';
import { logInfo, logError } from '../infra/log/logger';
import { config } from '../config/env';

export class CacheService {
  private cacheRepository = new CacheRepository();

  /**
   * Get cached response for a question
   * Returns null if cache miss or expired
   */
  async getCachedResponse(question: string): Promise<string | null> {
    try {
      const hash = generateQuestionHash(question);
      const cached = await this.cacheRepository.findByHash(hash);

      if (!cached) {
        logInfo('Cache miss', { questionHash: hash });
        return null;
      }

      // Check if cache is expired
      if (cached.expiresAt < new Date()) {
        logInfo('Cache expired', { questionHash: hash, expiresAt: cached.expiresAt });
        return null;
      }

      // Cache hit - increment hit count
      await this.cacheRepository.incrementHitCount(hash);
      logInfo('Cache hit', { 
        questionHash: hash, 
        hitCount: cached.hitCount + 1,
        age: Date.now() - cached.createdAt.getTime()
      });

      return cached.answer;
    } catch (error: any) {
      logError('Error getting cached response', error);
      // Return null on error to fallback to n8n
      return null;
    }
  }

  /**
   * Save response to cache
   */
  async saveCachedResponse(
    question: string,
    answer: string,
    ttlHours?: number
  ): Promise<void> {
    try {
      const hash = generateQuestionHash(question);
      const ttl = ttlHours || config.CACHE_TTL_HOURS;
      const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);

      await this.cacheRepository.create({
        questionHash: hash,
        question,
        answer,
        expiresAt,
      });

      logInfo('Response cached', { 
        questionHash: hash, 
        ttlHours: ttl,
        expiresAt 
      });
    } catch (error: any) {
      // Don't throw error if cache save fails
      // Just log it and continue
      logError('Error saving to cache', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    try {
      const deletedCount = await this.cacheRepository.deleteExpired();
      logInfo('Expired cache cleaned up', { deletedCount });
      return deletedCount;
    } catch (error: any) {
      logError('Error cleaning up expired cache', error);
      return 0;
    }
  }
}
