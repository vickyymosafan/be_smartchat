/**
 * Dashboard Routes
 * Routes untuk visual dashboard
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

/**
 * Create dashboard routes
 */
export function createDashboardRoutes(
  dashboardController: DashboardController
): Router {
  const router = Router();

  /**
   * GET / (root)
   * Serve dashboard HTML
   */
  router.get('/', (req, res) =>
    dashboardController.serveDashboard(req, res)
  );

  /**
   * GET /dashboard
   * Serve dashboard HTML (alias)
   */
  router.get('/dashboard', (req, res) =>
    dashboardController.serveDashboard(req, res)
  );

  /**
   * GET /api/dashboard/stats
   * Get dashboard statistics
   */
  router.get('/api/dashboard/stats', (req, res) =>
    dashboardController.getStats(req, res)
  );

  /**
   * GET /api/dashboard/activity
   * Get recent activity logs
   */
  router.get('/api/dashboard/activity', (req, res) =>
    dashboardController.getActivity(req, res)
  );

  /**
   * GET /api/dashboard/sessions
   * Get active sessions
   */
  router.get('/api/dashboard/sessions', (req, res) =>
    dashboardController.getSessions(req, res)
  );

  return router;
}
