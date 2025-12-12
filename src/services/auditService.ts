import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface AuditLogFilters {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

class AuditService {
  /**
   * Log an action to the audit log
   */
  async logAction(
    action: string,
    entity: string,
    entityId: string | null,
    performedBy: string,
    userId: string | null,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          id: uuidv4(),
          action,
          entity,
          entity_id: entityId,
          performed_by: performedBy,
          user_id: userId,
          details: details ? details : undefined,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw error to prevent blocking the main action
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters = {}) {
    try {
      const {
        action,
        entity,
        userId,
        startDate,
        endDate,
        page = 1,
        limit = 50, // Default limit
      } = filters;

      const where: any = {};

      if (action) where.action = { contains: action, mode: 'insensitive' };
      if (entity) where.entity = { contains: entity, mode: 'insensitive' };
      if (userId) where.user_id = userId;

      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at.gte = startDate;
        if (endDate) where.created_at.lte = endDate;
      }

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      const total = await prisma.auditLog.count({ where });

      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }
  }
}

export default new AuditService();
