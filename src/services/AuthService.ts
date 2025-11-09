/**
 * Auth Service
 * Handle PIN verification dan token management
 */

import crypto from 'crypto';
import { config } from '../config/env';

/**
 * Token storage
 * In-memory storage untuk active tokens
 * Format: Map<token, expiryTimestamp>
 */
const activeTokens = new Map<string, number>();

/**
 * Token expiry duration (24 hours in milliseconds)
 */
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export class AuthService {
  /**
   * Verify PIN code
   * Constant-time comparison untuk prevent timing attacks
   * 
   * @param pin - PIN yang diinput user
   * @returns true jika PIN valid, false jika tidak
   */
  verifyPin(pin: string): boolean {
    const expectedPin = config.PIN_CODE;
    
    // Constant-time comparison
    if (pin.length !== expectedPin.length) {
      return false;
    }

    let isValid = true;
    for (let i = 0; i < pin.length; i++) {
      if (pin[i] !== expectedPin[i]) {
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Generate secure random token
   * 
   * @returns Random token string
   */
  generateToken(): string {
    const randomBytes = crypto.randomBytes(32);
    const token = `auth_${randomBytes.toString('hex')}`;
    
    // Store token dengan expiry time
    const expiryTime = Date.now() + TOKEN_EXPIRY_MS;
    activeTokens.set(token, expiryTime);

    // Cleanup expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  /**
   * Validate token
   * Check if token exists dan belum expired
   * 
   * @param token - Token yang akan divalidasi
   * @returns true jika token valid, false jika tidak
   */
  validateToken(token: string): boolean {
    const expiryTime = activeTokens.get(token);

    if (!expiryTime) {
      return false; // Token tidak ditemukan
    }

    if (Date.now() > expiryTime) {
      // Token expired, hapus dari storage
      activeTokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Revoke token (logout)
   * 
   * @param token - Token yang akan di-revoke
   */
  revokeToken(token: string): void {
    activeTokens.delete(token);
  }

  /**
   * Cleanup expired tokens dari memory
   * Dipanggil setiap kali generate token baru
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    
    for (const [token, expiryTime] of activeTokens.entries()) {
      if (now > expiryTime) {
        activeTokens.delete(token);
      }
    }
  }

  /**
   * Get active tokens count (untuk monitoring)
   */
  getActiveTokensCount(): number {
    this.cleanupExpiredTokens();
    return activeTokens.size;
  }
}
