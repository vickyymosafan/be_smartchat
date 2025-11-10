import { prisma } from '../infra/db/prisma';
import { AuditLog } from '../generated/prisma';

/**
 * Repository untuk Audit Log operations
 * Centralized logging untuk security dan monitoring
 */
export class AuditLogRepository {
  /**
   * Create audit log entry
   */
  async create(data: {
    event: string;
    ipAddress?: string;
    sessionId?: string;
    success?: boolean;
    details?: any;
  }): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        event: data.event,
        ipAddress: data.ipAddress,
        sessionId: data.sessionId,
        success: data.success ?? true,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  }

  /**
   * Get logs by event type
   */
  async findByEvent(
    event: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { event },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get logs by IP address
   */
  async findByIp(
    ipAddress: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { ipAddress },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get logs by session
   */
  async findBySession(
    sessionId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get failed events count
   */
  async countFailedEvents(
    event: string,
    hoursAgo: number = 24
  ): Promise<number> {
    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    
    return prisma.auditLog.count({
      where: {
        event,
        success: false,
        createdAt: {
          gte: since,
        },
      },
    });
  }

  /**
   * Delete old logs (cleanup)
   */
  async deleteOlderThan(daysAgo: number = 90): Promise<number> {
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: since,
        },
      },
    });
    
    return result.count;
  }
}
