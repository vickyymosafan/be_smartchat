/**
 * Auth Service
 * Handle PIN verification dan token management
 * Menggunakan database untuk persist tokens
 * Includes brute force protection
 */

import { config } from '../config/env';
import { SessionRepository } from '../repositories/SessionRepository';
import { PinAttemptRepository } from '../repositories/PinAttemptRepository';
import { logInfo, logWarn } from '../infra/log/logger';
import {
  generateAuthToken,
  generateSessionId,
  calculateExpiryDate,
  SESSION_EXPIRY,
} from '../utils/sessionUtils';

/**
 * Max failed PIN attempts before blocking
 */
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Block duration in minutes after max attempts
 */
const BLOCK_DURATION_MINUTES = 15;

export class AuthService {
  private sessionRepository: SessionRepository;
  private pinAttemptRepository: PinAttemptRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
    this.pinAttemptRepository = new PinAttemptRepository();
  }
  /**
   * Check if IP is blocked due to too many failed attempts
   */
  async isIpBlocked(ipAddress: string): Promise<boolean> {
    const failedCount = await this.pinAttemptRepository.countFailedAttempts(
      ipAddress,
      BLOCK_DURATION_MINUTES
    );

    return failedCount >= MAX_FAILED_ATTEMPTS;
  }

  /**
   * Verify PIN code with brute force protection
   * Constant-time comparison untuk prevent timing attacks
   * 
   * @param pin - PIN yang diinput user
   * @param ipAddress - Client IP address
   * @returns Object dengan status dan message
   */
  async verifyPin(
    pin: string,
    ipAddress: string
  ): Promise<{ valid: boolean; message?: string }> {
    // Check if IP is blocked
    const isBlocked = await this.isIpBlocked(ipAddress);
    if (isBlocked) {
      logWarn('PIN verification blocked', { ipAddress });

      return {
        valid: false,
        message: `Terlalu banyak percobaan gagal. Coba lagi dalam ${BLOCK_DURATION_MINUTES} menit.`,
      };
    }

    // Validate PIN format (must be 6 digits)
    if (!/^\d{6}$/.test(pin)) {
      await this.pinAttemptRepository.create({
        ipAddress,
        success: false,
      });

      return {
        valid: false,
        message: 'PIN harus 6 digit angka',
      };
    }

    const expectedPin = config.PIN_CODE;

    // Constant-time comparison
    let isValid = true;
    if (pin.length !== expectedPin.length) {
      isValid = false;
    } else {
      for (let i = 0; i < pin.length; i++) {
        if (pin[i] !== expectedPin[i]) {
          isValid = false;
        }
      }
    }

    // Record attempt
    await this.pinAttemptRepository.create({
      ipAddress,
      success: isValid,
    });

    // Log result
    if (isValid) {
      logInfo('PIN verification successful', { ipAddress });
    } else {
      logWarn('PIN verification failed', { ipAddress });
    }

    return {
      valid: isValid,
      message: isValid ? undefined : 'PIN yang Anda masukkan salah',
    };
  }

  /**
   * Generate secure random token
   * Simpan ke database untuk persistence
   * 
   * @param ipAddress - Client IP address
   * @param userAgent - Client user agent
   * @returns Random token string
   */
  async generateToken(
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const token = generateAuthToken();
    const sessionId = generateSessionId();
    const expiresAt = calculateExpiryDate(SESSION_EXPIRY.AUTH_TOKEN);

    await this.sessionRepository.create({
      sessionId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });

    // Cleanup expired tokens
    await this.cleanupExpiredTokens();

    logInfo('Token generated and stored in database', {
      sessionId,
      ipAddress,
    });

    return token;
  }

  /**
   * Validate token
   * Check if token exists di database dan belum expired
   * 
   * @param token - Token yang akan divalidasi
   * @returns true jika token valid, false jika tidak
   */
  async validateToken(token: string): Promise<boolean> {
    const session = await this.sessionRepository.findByToken(token);

    if (!session) {
      return false; // Token tidak ditemukan
    }

    if (new Date() > session.expiresAt) {
      // Token expired, hapus dari database
      await this.sessionRepository.deleteByToken(token);
      return false;
    }

    return true;
  }

  /**
   * Revoke token (logout)
   * Hapus dari database
   * 
   * @param token - Token yang akan di-revoke
   */
  async revokeToken(token: string): Promise<void> {
    await this.sessionRepository.deleteByToken(token);
    logInfo('Token revoked', { token: token.substring(0, 10) + '...' });
  }

  /**
   * Cleanup expired tokens dari database
   * Dipanggil setiap kali generate token baru
   */
  async cleanupExpiredTokens(): Promise<void> {
    const deletedCount = await this.sessionRepository.deleteExpired();
    if (deletedCount > 0) {
      logInfo('Cleaned up expired tokens', { count: deletedCount });
    }
  }

  /**
   * Get active tokens count (untuk monitoring)
   */
  async getActiveTokensCount(): Promise<number> {
    await this.cleanupExpiredTokens();
    return await this.sessionRepository.countActive();
  }
}
