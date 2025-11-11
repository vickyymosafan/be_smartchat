import 'dotenv/config';
import { app } from './app';
import { config } from '../config/env';
import { logInfo, logError } from '../infra/log/logger';
import PrismaService from '../infra/db/prisma';

async function initializeDatabase() {
  try {
    await PrismaService.connect();
    const isHealthy = await PrismaService.healthCheck();
    
    if (isHealthy) {
      logInfo('✅ Database connected and healthy');
    } else {
      logError('⚠️  Database connected but health check failed');
    }
  } catch (error) {
    logError('❌ Failed to connect to database:', error);
    logError('⚠️  Server will start but database features will not work');
  }
}

const PORT = config.PORT;

async function startServer() {
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    logInfo(`🚀 Server berjalan di http://localhost:${PORT}`);
    logInfo(`📝 Environment: ${config.NODE_ENV}`);
    logInfo(`🔗 N8N Webhook: ${config.N8N_WEBHOOK_URL}`);
    logInfo(`🌐 Allowed Origins: ${config.FRONTEND_ORIGINS.join(', ')}`);
  });

  return server;
}

const serverPromise = startServer();
serverPromise.then((server) => {

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

  process.on('SIGTERM', async () => {
    logInfo('⚠️  SIGTERM signal received. Shutting down gracefully...');
    await PrismaService.disconnect();
    server.close(() => {
      logInfo('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    logInfo('⚠️  SIGINT signal received. Shutting down gracefully...');
    await PrismaService.disconnect();
    server.close(() => {
      logInfo('✅ Server closed');
      process.exit(0);
    });
  });
}).catch((error) => {
  logError('❌ Failed to start server:', error);
  process.exit(1);
});
