/**
 * Server Bootstrap
 * Start Express server untuk local development
 * 
 * Note: File ini hanya digunakan untuk local development.
 * Untuk Vercel deployment, gunakan api/index.ts sebagai serverless handler.
 */

import { app } from './app';
import { config } from '../config/env';
import { logInfo, logError } from '../infra/log/logger';

/**
 * Start server
 */
const PORT = config.PORT;

const server = app.listen(PORT, () => {
  logInfo(`🚀 Server berjalan di http://localhost:${PORT}`);
  logInfo(`📝 Environment: ${config.NODE_ENV}`);
  logInfo(`🔗 N8N Webhook: ${config.N8N_WEBHOOK_URL}`);
  logInfo(`🌐 Allowed Origins: ${config.FRONTEND_ORIGINS.join(', ')}`);
});

/**
 * Handle server errors
 */
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logError(`❌ Port ${PORT} sudah digunakan. Gunakan port lain atau stop aplikasi yang menggunakan port tersebut.`);
  } else if (error.code === 'EACCES') {
    logError(`❌ Tidak ada permission untuk bind ke port ${PORT}. Gunakan port > 1024 atau jalankan dengan sudo.`);
  } else {
    logError('❌ Server error:', error);
  }
  process.exit(1);
});

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', () => {
  logInfo('⚠️  SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logInfo('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logInfo('⚠️  SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    logInfo('✅ Server closed');
    process.exit(0);
  });
});
