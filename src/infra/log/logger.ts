/**
 * Logging Utility
 * Centralized logging dengan morgan untuk HTTP request logging
 */

import morgan from 'morgan';
import { config } from '../../config/env';

/**
 * Morgan middleware untuk HTTP request logging
 * Format: :method :url :status :response-time ms
 * 
 * Tidak log request body untuk menjaga privasi
 */
export const requestLogger = morgan(':method :url :status :response-time ms');

/**
 * Utility functions untuk manual logging
 */

/**
 * Log info message
 * @param message - Message to log
 * @param meta - Optional metadata
 */
export function logInfo(message: string, meta?: any): void {
  if (shouldLog('info')) {
    console.log(`[INFO] ${message}`, meta ? meta : '');
  }
}

/**
 * Log error message
 * @param message - Error message
 * @param error - Optional error object
 */
export function logError(message: string, error?: any): void {
  if (shouldLog('error')) {
    console.error(`[ERROR] ${message}`, error ? error : '');
  }
}

/**
 * Log warning message
 * @param message - Warning message
 * @param meta - Optional metadata
 */
export function logWarn(message: string, meta?: any): void {
  if (shouldLog('warn')) {
    console.warn(`[WARN] ${message}`, meta ? meta : '');
  }
}

/**
 * Log debug message
 * @param message - Debug message
 * @param meta - Optional metadata
 */
export function logDebug(message: string, meta?: any): void {
  if (shouldLog('debug')) {
    console.debug(`[DEBUG] ${message}`, meta ? meta : '');
  }
}

/**
 * Cek apakah level log harus ditampilkan
 * @param level - Log level to check
 * @returns true jika harus log, false jika tidak
 */
function shouldLog(level: string): boolean {
  const logLevel = config.LOG_LEVEL.toLowerCase();
  const levels = ['error', 'warn', 'info', 'debug'];
  
  const currentLevelIndex = levels.indexOf(logLevel);
  const requestedLevelIndex = levels.indexOf(level);
  
  // Jika log level tidak valid, default ke info
  if (currentLevelIndex === -1) {
    return requestedLevelIndex <= 2; // error, warn, info
  }
  
  return requestedLevelIndex <= currentLevelIndex;
}
