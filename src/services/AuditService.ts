/**
 * Audit Service
 * Centralized service untuk security dan system event logging
 */

import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { logInfo } from '../infra/log/logger';

/**
 * Audit event types
 */
export enum AuditEvent {
  PIN_VERIFY_SUCCESS = 'PIN_VERIFY_SUCCESS',
  PIN_VERIFY_FAILED = 'PIN_VERIFY_FAILED',
  PIN_BLOCKED = 'PIN_BLOCKED',
  TOKEN_GENERATED = 'TOKEN_GENERATED',
  TOKEN_VALIDATED = 'TOKEN_VALIDATED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  SESSION_CREATED = 'SESSION_CREATED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  N8N_REQUEST_SUCCESS = 'N8N_REQUEST_SUCCESS',
  N8N_REQUEST_FAILED = 'N8N_REQUEST_FAILED',
}

export class AuditService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  /**
   * Log audit event
   */
  async log(
    event: AuditEvent,
    options?: {
      ipAddress?: string;
      sessionId?: string;
      success?: boolean;
      details?: any;
    }
  ): Promise<void> {
    try {
      await this.auditLogRepository.create({
        event,
        ipAddress: options?.ipAddress,
        sessionId: options?.sessionId,
        success: options?.success ?? true,
        details: options?.details,
      });

      logInfo('Audit event logged', {
        event,
        ipAddress: options?.ipAddress,
        sessionId: options?.sessionId,
      });
    } catch (error) {
      // Don't throw - audit logging should not break main flow
      logInfo('Failed to log audit event', { event, error });
    }
  }

  /**
   * Get recent events
   */
  async getRecentEvents(limit: number = 100) {
    return this.auditLogRepository.findByEvent('', limit);
  }

  /**
   * Get events by IP
   */
  async getEventsByIp(ipAddress: string, limit: number = 100) {
    return this.auditLogRepository.findByIp(ipAddress, limit);
  }

  /**
   * Get events by session
   */
  async getEventsBySession(sessionId: string, limit: number = 100) {
    return this.auditLogRepository.findBySession(sessionId, limit);
  }

  /**
   * Cleanup old logs
   */
  async cleanup(daysAgo: number = 90): Promise<number> {
    return this.auditLogRepository.deleteOlderThan(daysAgo);
  }
}
