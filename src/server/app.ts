import express, { Express } from 'express';
import helmet from 'helmet';
import { requestLogger } from '../infra/log/logger';
import { corsMiddleware } from '../middlewares/cors';
import { errorHandler } from '../middlewares/errorHandler';
import { AxiosHttpClient } from '../infra/http/AxiosHttpClient';
import { ChatService } from '../services/ChatService';
import { ChatController } from '../controllers/ChatController';
import { ChatHistoryService } from '../services/ChatHistoryService';
import { ChatHistoryController } from '../controllers/ChatHistoryController';
import { createChatRoutes, createHealthRoute } from '../routes/chatRoutes';
import { createChatHistoryRoutes } from '../routes/chatHistoryRoutes';
import { createDashboardRoutes } from '../routes/dashboardRoutes';
import { DashboardController } from '../controllers/DashboardController';

const app: Express = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log('[DEBUG] Request:', {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'origin': req.headers['origin'],
      }
    });
    next();
  });
}

app.use(requestLogger);
app.use(corsMiddleware);

const httpClient = new AxiosHttpClient();
const chatService = new ChatService(httpClient);
const chatHistoryService = new ChatHistoryService();
const chatController = new ChatController(chatService);
const chatHistoryController = new ChatHistoryController(chatHistoryService);
const dashboardController = new DashboardController();

const chatRoutes = createChatRoutes(chatController);
const chatHistoryRoutes = createChatHistoryRoutes(chatHistoryController);
const dashboardRoutes = createDashboardRoutes(dashboardController);
const healthRoute = createHealthRoute(chatController);

app.use(healthRoute);
app.use(dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat', chatHistoryRoutes);
app.use(errorHandler);

export { app };
