import morgan from 'morgan';
import { config } from '../../config/env';

export const requestLogger = morgan(':method :url :status :response-time ms');

export function logInfo(message: string, meta?: any): void {
  if (shouldLog('info')) {
    console.log(`[INFO] ${message}`, meta || '');
  }
}

export function logError(message: string, error?: any): void {
  if (shouldLog('error')) {
    console.error(`[ERROR] ${message}`, error || '');
  }
}

export function logWarn(message: string, meta?: any): void {
  if (shouldLog('warn')) {
    console.warn(`[WARN] ${message}`, meta || '');
  }
}

export function logDebug(message: string, meta?: any): void {
  if (shouldLog('debug')) {
    console.debug(`[DEBUG] ${message}`, meta || '');
  }
}

function shouldLog(level: string): boolean {
  const logLevel = config.LOG_LEVEL.toLowerCase();
  const levels = ['error', 'warn', 'info', 'debug'];
  
  const currentLevelIndex = levels.indexOf(logLevel);
  const requestedLevelIndex = levels.indexOf(level);
  
  if (currentLevelIndex === -1) {
    return requestedLevelIndex <= 2;
  }
  
  return requestedLevelIndex <= currentLevelIndex;
}
