import { Request, Response } from 'express';
import analyticsService from '../services/analyticsService';

class AnalyticsController {
  /**
   * Get comprehensive dashboard analytics
   * GET /api/v1/analytics/dashboard
   */
  async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const companyId = req.tenantId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      const analytics = await analyticsService.getDashboardAnalytics(companyId);

      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      console.error('Error in getDashboardAnalytics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard analytics',
      });
    }
  }

  /**
   * Get revenue trends
   * GET /api/v1/analytics/revenue-trends
   */
  async getRevenueTrends(req: Request, res: Response) {
    try {
      const companyId = req.tenantId;
      const months = parseInt(req.query.months as string) || 12;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      const trends = await analyticsService.getRevenueTrends(companyId, months);

      return res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error: any) {
      console.error('Error in getRevenueTrends:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch revenue trends',
      });
    }
  }

  /**
   * Get top selling products
   * GET /api/v1/analytics/top-products
   */
  async getTopProducts(req: Request, res: Response) {
    try {
      const companyId = req.tenantId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      const products = await analyticsService.getTopProducts(companyId, limit);

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      console.error('Error in getTopProducts:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch top products',
      });
    }
  }

  /**
   * Get top customers
   * GET /api/v1/analytics/top-customers
   */
  async getTopCustomers(req: Request, res: Response) {
    try {
      const companyId = req.tenantId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      const customers = await analyticsService.getTopCustomers(companyId, limit);

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error: any) {
      console.error('Error in getTopCustomers:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch top customers',
      });
    }
  }

  /**
   * Get quality metrics summary
   * GET /api/v1/analytics/quality-metrics
   */
  async getQualityMetrics(req: Request, res: Response) {
    try {
      const companyId = req.tenantId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      const metrics = await analyticsService.getQualityMetrics(companyId);

      return res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Error in getQualityMetrics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch quality metrics',
      });
    }
  }

  /**
   * Get production summary
   * GET /api/v1/analytics/production-summary
   */
  async getProductionSummary(req: Request, res: Response) {
    try {
      const companyId = req.tenantId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      const summary = await analyticsService.getProductionSummary(companyId);

      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error('Error in getProductionSummary:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch production summary',
      });
    }
  }
}

export default new AnalyticsController();
