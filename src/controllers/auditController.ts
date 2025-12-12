import { Request, Response } from 'express';
import auditService from '../services/auditService';

class AuditController {
  // Get audit logs
  async getLogs(req: Request, res: Response) {
    try {
      // Basic role check - ideally middleware handles this
      const userRole = (req as any).userRole; // Assuming this is set by auth middleware

      // Allow OWNER and ADMIN
      if (!['OWNER', 'ADMIN'].includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only Admins can view audit logs.',
        });
      }

      const filters = {
        action: req.query.action as string,
        entity: req.query.entity as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await auditService.getAuditLogs(filters);

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch audit logs',
      });
    }
  }
}

export default new AuditController();
