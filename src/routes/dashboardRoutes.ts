import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

export function createDashboardRoutes(
  dashboardController: DashboardController
): Router {
  const router = Router();

  router.get('/', (req, res) =>
    dashboardController.serveDashboard(req, res)
  );

  router.get('/dashboard', (req, res) =>
    dashboardController.serveDashboard(req, res)
  );

  router.get('/api/dashboard/stats', (req, res) =>
    dashboardController.getStats(req, res)
  );

  router.get('/api/dashboard/activity', (req, res) =>
    dashboardController.getActivity(req, res)
  );

  router.get('/api/dashboard/sessions', (req, res) =>
    dashboardController.getSessions(req, res)
  );

  return router;
}
