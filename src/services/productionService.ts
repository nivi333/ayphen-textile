import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { databaseManager } from '../database/connection';

export interface CreateProductionOrderData {
  orderNumber: string;
  locationId: string;
  productName: string;
  productSku?: string;
  category: 'RAW_MATERIAL' | 'WORK_IN_PROGRESS' | 'FINISHED_GOODS' | 'CONSUMABLES' | 'PACKAGING';
  fiberType?: string;
  yarnCount?: string;
  gsm?: number;
  fabricType?: string;
  color?: string;
  width?: number;
  designPattern?: string;
  orderedQuantity: number;
  unitOfMeasure: string;
  priority: string;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  status:
    | 'DRAFT'
    | 'CONFIRMED'
    | 'IN_PRODUCTION'
    | 'QUALITY_CHECK'
    | 'READY'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';
  estimatedCost?: number;
  actualCost?: number;
  qualityStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'REJECTED';
  batchNumber?: string;
  lotNumber?: string;
  salesOrderId?: string;
  customerId?: string;
  assignedTo?: string;
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface UpdateProductionOrderData extends Partial<CreateProductionOrderData> {
  id: string;
}

export interface CreateWorkOrderData {
  productionOrderId: string;
  locationId: string;
  workOrderNumber: string;
  operationName: string;
  operationType: string;
  machineId?: string;
  operatorId?: string;
  plannedQuantity: number;
  unitOfMeasure: string;
  plannedStartTime?: Date;
  plannedEndTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: string;
  priority: string;
  qualityCheckRequired?: boolean;
  notes?: string;
}

export interface UpdateWorkOrderData extends Partial<CreateWorkOrderData> {
  id: string;
}

export class ProductionService {
  private getTenantPrisma(tenantId: string): PrismaClient {
    return databaseManager.getTenantPrisma(tenantId);
  }

  // Production Orders CRUD
  async createProductionOrder(tenantId: string, userId: string, data: CreateProductionOrderData) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const order = await prisma.tenantProductionOrder.create({
        data: {
          tenantId,
          locationId: data.locationId,
          orderNumber: data.orderNumber,
          productName: data.productName,
          productSku: data.productSku,
          category: data.category,
          fiberType: data.fiberType,
          yarnCount: data.yarnCount,
          gsm: data.gsm,
          fabricType: data.fabricType,
          color: data.color,
          width: data.width,
          designPattern: data.designPattern,
          orderedQuantity: data.orderedQuantity,
          producedQuantity: 0,
          rejectedQuantity: 0,
          unitOfMeasure: data.unitOfMeasure,
          status: data.status,
          priority: data.priority,
          plannedStartDate: data.plannedStartDate,
          plannedEndDate: data.plannedEndDate,
          actualStartDate: data.actualStartDate,
          actualEndDate: data.actualEndDate,
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          qualityStatus: data.qualityStatus || 'PENDING',
          batchNumber: data.batchNumber,
          lotNumber: data.lotNumber,
          salesOrderId: data.salesOrderId,
          customerId: data.customerId,
          assignedTo: data.assignedTo,
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt,
          notes: data.notes,
        },
      });

      logger.info(`Production order created: ${order.id} by user ${userId}`);
      return order;
    } catch (error: any) {
      logger.error('Error creating production order:', error);
      throw new Error(`Failed to create production order: ${error.message}`);
    }
  }

  async getProductionOrders(
    tenantId: string,
    filters?: {
      status?: string;
      priority?: string;
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const where: any = { tenantId };

      if (filters?.status) where.status = filters.status;
      if (filters?.priority) where.priority = filters.priority;
      if (filters?.customerId) where.customerId = filters.customerId;
      if (filters?.startDate || filters?.endDate) {
        where.plannedStartDate = {};
        if (filters.startDate) where.plannedStartDate.gte = filters.startDate;
        if (filters.endDate) where.plannedStartDate.lte = filters.endDate;
      }

      const orders = await prisma.tenantProductionOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return orders;
    } catch (error: any) {
      logger.error('Error fetching production orders:', error);
      throw new Error(`Failed to fetch production orders: ${error.message}`);
    }
  }

  async getProductionOrderById(tenantId: string, orderId: string) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const order = await prisma.tenantProductionOrder.findFirst({
        where: {
          id: orderId,
          tenantId,
        },
      });

      if (!order) {
        throw new Error('Production order not found');
      }

      return order;
    } catch (error: any) {
      logger.error('Error fetching production order:', error);
      throw new Error(`Failed to fetch production order: ${error.message}`);
    }
  }

  async updateProductionOrder(tenantId: string, userId: string, data: UpdateProductionOrderData) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const order = await prisma.tenantProductionOrder.update({
        where: {
          id: data.id,
          tenantId,
        },
        data: {
          orderNumber: data.orderNumber,
          productName: data.productName,
          productSku: data.productSku,
          category: data.category,
          fiberType: data.fiberType,
          yarnCount: data.yarnCount,
          gsm: data.gsm,
          fabricType: data.fabricType,
          color: data.color,
          width: data.width,
          designPattern: data.designPattern,
          orderedQuantity: data.orderedQuantity,
          unitOfMeasure: data.unitOfMeasure,
          status: data.status,
          priority: data.priority,
          plannedStartDate: data.plannedStartDate,
          plannedEndDate: data.plannedEndDate,
          actualStartDate: data.actualStartDate,
          actualEndDate: data.actualEndDate,
          estimatedCost: data.estimatedCost,
          actualCost: data.actualCost,
          qualityStatus: data.qualityStatus,
          batchNumber: data.batchNumber,
          lotNumber: data.lotNumber,
          salesOrderId: data.salesOrderId,
          customerId: data.customerId,
          assignedTo: data.assignedTo,
          approvedBy: data.approvedBy,
          approvedAt: data.approvedAt,
          notes: data.notes,
        },
      });

      logger.info(`Production order updated: ${order.id} by user ${userId}`);
      return order;
    } catch (error: any) {
      logger.error('Error updating production order:', error);
      throw new Error(`Failed to update production order: ${error.message}`);
    }
  }

  async deleteProductionOrder(tenantId: string, orderId: string) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      // Check if order has work orders
      const workOrderCount = await prisma.tenantWorkOrder.count({
        where: {
          productionOrderId: orderId,
          tenantId,
        },
      });

      if (workOrderCount > 0) {
        throw new Error('Cannot delete production order with existing work orders');
      }

      await prisma.tenantProductionOrder.delete({
        where: {
          id: orderId,
          tenantId,
        },
      });

      logger.info(`Production order deleted: ${orderId}`);
      return { success: true };
    } catch (error: any) {
      logger.error('Error deleting production order:', error);
      throw new Error(`Failed to delete production order: ${error.message}`);
    }
  }

  // Work Orders CRUD
  async createWorkOrder(tenantId: string, userId: string, data: CreateWorkOrderData) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const workOrder = await prisma.tenantWorkOrder.create({
        data: {
          tenantId,
          productionOrderId: data.productionOrderId,
          locationId: data.locationId,
          workOrderNumber: data.workOrderNumber,
          operationName: data.operationName,
          operationType: data.operationType,
          machineId: data.machineId,
          operatorId: data.operatorId,
          plannedQuantity: data.plannedQuantity,
          completedQuantity: 0,
          rejectedQuantity: 0,
          unitOfMeasure: data.unitOfMeasure,
          plannedStartTime: data.plannedStartTime,
          actualStartTime: data.actualStartTime,
          plannedEndTime: data.plannedEndTime,
          actualEndTime: data.actualEndTime,
          status: data.status,
          priority: data.priority,
          qualityCheckRequired: data.qualityCheckRequired || false,
          notes: data.notes,
        },
      });

      logger.info(`Work order created: ${workOrder.id} by user ${userId}`);
      return workOrder;
    } catch (error: any) {
      logger.error('Error creating work order:', error);
      throw new Error(`Failed to create work order: ${error.message}`);
    }
  }

  async getWorkOrders(
    tenantId: string,
    filters?: {
      productionOrderId?: string;
      status?: string;
      operatorId?: string;
    }
  ) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const where: any = { tenantId };

      if (filters?.productionOrderId) where.productionOrderId = filters.productionOrderId;
      if (filters?.status) where.status = filters.status;
      if (filters?.operatorId) where.operatorId = filters.operatorId;

      const workOrders = await prisma.tenantWorkOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return workOrders;
    } catch (error: any) {
      logger.error('Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }
  }

  async updateWorkOrder(tenantId: string, userId: string, data: UpdateWorkOrderData) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const workOrder = await prisma.tenantWorkOrder.update({
        where: {
          id: data.id,
          tenantId,
        },
        data: {
          operationName: data.operationName,
          operationType: data.operationType,
          machineId: data.machineId,
          operatorId: data.operatorId,
          plannedQuantity: data.plannedQuantity,
          unitOfMeasure: data.unitOfMeasure,
          plannedStartTime: data.plannedStartTime,
          actualStartTime: data.actualStartTime,
          plannedEndTime: data.plannedEndTime,
          actualEndTime: data.actualEndTime,
          status: data.status,
          priority: data.priority,
          qualityCheckRequired: data.qualityCheckRequired,
          notes: data.notes,
        },
      });

      logger.info(`Work order updated: ${workOrder.id} by user ${userId}`);
      return workOrder;
    } catch (error: any) {
      logger.error('Error updating work order:', error);
      throw new Error(`Failed to update work order: ${error.message}`);
    }
  }

  // Analytics and Summary
  async getProductionSummary(tenantId: string, dateRange?: { start: Date; end: Date }) {
    try {
      const prisma = this.getTenantPrisma(tenantId);

      const whereClause: any = { tenantId };
      if (dateRange) {
        whereClause.createdAt = {
          gte: dateRange.start,
          lte: dateRange.end,
        };
      }

      // Get basic counts by status using separate queries
      const draftOrders = await prisma.tenantProductionOrder.count({
        where: { ...whereClause, status: 'DRAFT' },
      });
      const confirmedOrders = await prisma.tenantProductionOrder.count({
        where: { ...whereClause, status: 'CONFIRMED' },
      });
      const inProgressOrders = await prisma.tenantProductionOrder.count({
        where: { ...whereClause, status: 'IN_PRODUCTION' },
      });
      const completedOrders = await prisma.tenantProductionOrder.count({
        where: { ...whereClause, status: 'COMPLETED' },
      });

      // Work order stats
      const pendingWorkOrders = await prisma.tenantWorkOrder.count({
        where: { ...whereClause, status: 'PENDING' },
      });
      const inProgressWorkOrders = await prisma.tenantWorkOrder.count({
        where: { ...whereClause, status: 'IN_PROGRESS' },
      });
      const completedWorkOrders = await prisma.tenantWorkOrder.count({
        where: { ...whereClause, status: 'COMPLETED' },
      });

      // Get total orders and calculate efficiency
      const totalOrders = draftOrders + confirmedOrders + inProgressOrders + completedOrders;
      const efficiency = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      return {
        orderStats: [
          { status: 'DRAFT', _count: { id: draftOrders } },
          { status: 'CONFIRMED', _count: { id: confirmedOrders } },
          { status: 'IN_PRODUCTION', _count: { id: inProgressOrders } },
          { status: 'COMPLETED', _count: { id: completedOrders } },
        ],
        workOrderStats: [
          { status: 'PENDING', _count: { id: pendingWorkOrders } },
          { status: 'IN_PROGRESS', _count: { id: inProgressWorkOrders } },
          { status: 'COMPLETED', _count: { id: completedWorkOrders } },
        ],
        efficiency: Math.round(efficiency * 100) / 100,
        totalOrders,
        completedOrders,
      };
    } catch (error: any) {
      logger.error('Error fetching production summary:', error);
      throw new Error(`Failed to fetch production summary: ${error.message}`);
    }
  }

  // Reference Data
  async getProductionStatuses() {
    return [
      { value: 'PLANNED', label: 'Planned' },
      { value: 'CONFIRMED', label: 'Confirmed' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' },
      { value: 'ON_HOLD', label: 'On Hold' },
    ];
  }

  async getPriorityLevels() {
    return [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' },
      { value: 'URGENT', label: 'Urgent' },
    ];
  }

  async getOperationTypes() {
    return [
      { value: 'SPINNING', label: 'Spinning' },
      { value: 'WEAVING', label: 'Weaving' },
      { value: 'KNITTING', label: 'Knitting' },
      { value: 'DYEING', label: 'Dyeing' },
      { value: 'PRINTING', label: 'Printing' },
      { value: 'FINISHING', label: 'Finishing' },
      { value: 'CUTTING', label: 'Cutting' },
      { value: 'SEWING', label: 'Sewing' },
      { value: 'PACKAGING', label: 'Packaging' },
      { value: 'QUALITY_CHECK', label: 'Quality Check' },
    ];
  }

  async getTextileOperations() {
    // More detailed textile-specific operations
    return [
      // Spinning Operations
      { value: 'BLOWROOM', label: 'Blowroom', category: 'SPINNING' },
      { value: 'CARDING', label: 'Carding', category: 'SPINNING' },
      { value: 'COMBING', label: 'Combing', category: 'SPINNING' },
      { value: 'DRAWING', label: 'Drawing', category: 'SPINNING' },
      { value: 'ROVING', label: 'Roving', category: 'SPINNING' },
      { value: 'SPINNING', label: 'Ring Spinning', category: 'SPINNING' },

      // Weaving Operations
      { value: 'WARPING', label: 'Warping', category: 'WEAVING' },
      { value: 'SIZING', label: 'Sizing', category: 'WEAVING' },
      { value: 'WEAVING', label: 'Weaving', category: 'WEAVING' },
      { value: 'INSPECTION', label: 'Fabric Inspection', category: 'WEAVING' },

      // Processing Operations
      { value: 'DESIZING', label: 'Desizing', category: 'PROCESSING' },
      { value: 'SCOURING', label: 'Scouring', category: 'PROCESSING' },
      { value: 'BLEACHING', label: 'Bleaching', category: 'PROCESSING' },
      { value: 'MERCERIZING', label: 'Mercerizing', category: 'PROCESSING' },
      { value: 'DYEING', label: 'Dyeing', category: 'PROCESSING' },
      { value: 'PRINTING', label: 'Printing', category: 'PROCESSING' },
      { value: 'FINISHING', label: 'Finishing', category: 'PROCESSING' },

      // Garment Operations
      { value: 'CUTTING', label: 'Cutting', category: 'GARMENT' },
      { value: 'SEWING', label: 'Sewing', category: 'GARMENT' },
      { value: 'PACKAGING', label: 'Packaging', category: 'GARMENT' },
      { value: 'QUALITY_CONTROL', label: 'Quality Control', category: 'GARMENT' },
    ];
  }
}

export const productionService = new ProductionService();
