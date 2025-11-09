/**
 * Configuration Layer
 * Single source of truth untuk environment variables dengan validasi
 */

export interface EnvConfig {
  N8N_WEBHOOK_URL: string;
  FRONTEND_ORIGINS: string[];
  PIN_CODE: string;
  PORT: number;
  N8N_TIMEOUT_MS: number;
  LOG_LEVEL: string;
  NODE_ENV: string;
}

/**
 * Validasi dan load environment variables
 * Fail fast jika ada variabel wajib yang tidak ada
 */
function loadConfig(): EnvConfig {
  // Validasi variabel wajib
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const frontendOrigins = process.env.FRONTEND_ORIGINS;
  const pinCode = process.env.PIN_CODE;

  if (!n8nWebhookUrl) {
    throw new Error(
      'N8N_WEBHOOK_URL tidak ditemukan. Pastikan environment variable sudah diset.'
    );
  }

  if (!frontendOrigins) {
    throw new Error(
      'FRONTEND_ORIGINS tidak ditemukan. Pastikan environment variable sudah diset.'
    );
  }

  if (!pinCode) {
    throw new Error(
      'PIN_CODE tidak ditemukan. Pastikan environment variable sudah diset.'
    );
  }

  // Parse FRONTEND_ORIGINS dari CSV string ke array
  const originsArray = frontendOrigins
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  if (originsArray.length === 0) {
    throw new Error(
      'FRONTEND_ORIGINS tidak boleh kosong. Berikan minimal satu origin.'
    );
  }

  // Default values untuk variabel opsional
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const n8nTimeoutMs = process.env.N8N_TIMEOUT_MS
    ? parseInt(process.env.N8N_TIMEOUT_MS, 10)
    : 15000;
  const logLevel = process.env.LOG_LEVEL || 'info';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Validasi PORT adalah number yang valid
  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(
      `PORT tidak valid: ${process.env.PORT}. Harus berupa angka antara 1-65535.`
    );
  }

  // Validasi N8N_TIMEOUT_MS adalah number yang valid
  if (isNaN(n8nTimeoutMs) || n8nTimeoutMs <= 0) {
    throw new Error(
      `N8N_TIMEOUT_MS tidak valid: ${process.env.N8N_TIMEOUT_MS}. Harus berupa angka positif.`
    );
  }

  return {
    N8N_WEBHOOK_URL: n8nWebhookUrl,
    FRONTEND_ORIGINS: originsArray,
    PIN_CODE: pinCode,
    PORT: port,
    N8N_TIMEOUT_MS: n8nTimeoutMs,
    LOG_LEVEL: logLevel,
    NODE_ENV: nodeEnv,
  };
}

// Export config sebagai singleton
export const config: EnvConfig = loadConfig();
