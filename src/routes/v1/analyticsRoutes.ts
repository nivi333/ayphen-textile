import express from 'express';
import analyticsController from '../../controllers/analyticsController';
import { tenantIsolationMiddleware, requireRole } from '../../middleware/tenantIsolation';

const router = express.Router();

// Apply tenant isolation to all routes
router.use(tenantIsolationMiddleware);

/**
 * @route   GET /api/v1/analytics/dashboard
 * @desc    Get comprehensive dashboard analytics
 * @access  Private (All roles)
 */
router.get(
  '/dashboard',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  analyticsController.getDashboardAnalytics
);

/**
 * @route   GET /api/v1/analytics/revenue-trends
 * @desc    Get revenue trends for last N months
 * @access  Private (OWNER, ADMIN, MANAGER)
 */
router.get(
  '/revenue-trends',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  analyticsController.getRevenueTrends
);

/**
 * @route   GET /api/v1/analytics/top-products
 * @desc    Get top selling products
 * @access  Private (All roles)
 */
router.get(
  '/top-products',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  analyticsController.getTopProducts
);

/**
 * @route   GET /api/v1/analytics/top-customers
 * @desc    Get top customers by revenue
 * @access  Private (OWNER, ADMIN, MANAGER)
 */
router.get(
  '/top-customers',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  analyticsController.getTopCustomers
);

/**
 * @route   GET /api/v1/analytics/quality-metrics
 * @desc    Get quality metrics summary
 * @access  Private (All roles)
 */
router.get(
  '/quality-metrics',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  analyticsController.getQualityMetrics
);

/**
 * @route   GET /api/v1/analytics/production-summary
 * @desc    Get production summary
 * @access  Private (All roles)
 */
router.get(
  '/production-summary',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  analyticsController.getProductionSummary
);

export default router;
