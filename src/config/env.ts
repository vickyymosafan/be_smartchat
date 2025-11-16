export interface EnvConfig {
  N8N_WEBHOOK_URL: string;
  FRONTEND_ORIGINS: string[];
  PORT: number;
  N8N_TIMEOUT_MS: number;
  LOG_LEVEL: string;
  NODE_ENV: string;
  CACHE_TTL_HOURS: number;
}

function loadConfig(): EnvConfig {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const frontendOrigins = process.env.FRONTEND_ORIGINS;

  if (!n8nWebhookUrl) {
    throw new Error('N8N_WEBHOOK_URL tidak ditemukan');
  }

  if (!frontendOrigins) {
    throw new Error('FRONTEND_ORIGINS tidak ditemukan');
  }

  const originsArray = frontendOrigins
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);

  if (originsArray.length === 0) {
    throw new Error('FRONTEND_ORIGINS tidak boleh kosong');
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const n8nTimeoutMs = process.env.N8N_TIMEOUT_MS
    ? parseInt(process.env.N8N_TIMEOUT_MS, 10)
    : 15000;
  const cacheTtlHours = process.env.CACHE_TTL_HOURS
    ? parseInt(process.env.CACHE_TTL_HOURS, 10)
    : 24;
  const logLevel = process.env.LOG_LEVEL || 'info';
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT tidak valid: ${process.env.PORT}`);
  }

  if (isNaN(n8nTimeoutMs) || n8nTimeoutMs <= 0) {
    throw new Error(`N8N_TIMEOUT_MS tidak valid: ${process.env.N8N_TIMEOUT_MS}`);
  }

  return {
    N8N_WEBHOOK_URL: n8nWebhookUrl,
    FRONTEND_ORIGINS: originsArray,
    PORT: port,
    N8N_TIMEOUT_MS: n8nTimeoutMs,
    LOG_LEVEL: logLevel,
    NODE_ENV: nodeEnv,
    CACHE_TTL_HOURS: cacheTtlHours,
  };
}

export const config: EnvConfig = loadConfig();
