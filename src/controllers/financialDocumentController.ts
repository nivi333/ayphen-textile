import { Request, Response } from 'express';
import Joi from 'joi';
import { financialDocumentService } from '../services/financialDocumentService';
import { logger } from '../utils/logger';
import { FinancialDocumentType } from '../types';

const baseDocSchema = {
  partyName: Joi.string().min(1).max(255).required(),
  partyCode: Joi.string().max(100).optional(),
  issueDate: Joi.date().required(),
  dueDate: Joi.date().min(Joi.ref('issueDate')).optional(),
  currency: Joi.string().max(10).optional(),
  subtotalAmount: Joi.number().min(0).required(),
  taxAmount: Joi.number().min(0).required(),
  totalAmount: Joi.number().min(0).required(),
  notes: Joi.string().max(1000).optional(),
};

const createInvoiceForOrderSchema = Joi.object({
  ...baseDocSchema,
  orderId: Joi.string().min(1).required(),
  locationId: Joi.string().optional(),
});

const createBillSchema = Joi.object({
  ...baseDocSchema,
});

const createPurchaseOrderSchema = Joi.object({
  ...baseDocSchema,
  locationId: Joi.string().required(),
});

const listFinancialDocumentsSchema = Joi.object({
  type: Joi.string().valid('INVOICE', 'BILL', 'PURCHASE_ORDER').optional(),
  from: Joi.date().optional(),
  to: Joi.date().optional(),
  locationId: Joi.string().optional(),
  orderId: Joi.string().optional(),
});

export class FinancialDocumentController {
  async createInvoiceForOrder(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createInvoiceForOrderSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const { tenantId } = req;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      const doc = await financialDocumentService.createInvoiceForOrder(tenantId, value);

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: doc,
      });
    } catch (error: any) {
      logger.error('Error creating invoice for order:', error);

      if (error.message === 'Order not found') {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      res.status(400).json({
        success: false,
        message: error?.message || 'Failed to create invoice',
      });
    }
  }

  async createBill(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createBillSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const { tenantId } = req;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      const doc = await financialDocumentService.createBill(tenantId, value);

      res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        data: doc,
      });
    } catch (error: any) {
      logger.error('Error creating bill:', error);
      res.status(400).json({
        success: false,
        message: error?.message || 'Failed to create bill',
      });
    }
  }

  async createPurchaseOrder(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createPurchaseOrderSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const { tenantId } = req;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      const doc = await financialDocumentService.createPurchaseOrder(tenantId, value);

      res.status(201).json({
        success: true,
        message: 'Purchase order created successfully',
        data: doc,
      });
    } catch (error: any) {
      logger.error('Error creating purchase order:', error);
      res.status(400).json({
        success: false,
        message: error?.message || 'Failed to create purchase order',
      });
    }
  }

  async getFinancialDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      const { error, value } = listFinancialDocumentsSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const filters: any = {};

      if (value.type) {
        filters.type = value.type as FinancialDocumentType;
      }

      if (value.from) {
        filters.fromDate = new Date(value.from);
      }

      if (value.to) {
        filters.toDate = new Date(value.to);
      }

      if (value.locationId) {
        filters.locationId = value.locationId as string;
      }

      if (value.orderId) {
        filters.orderId = value.orderId as string;
      }

      const docs = await financialDocumentService.getFinancialDocuments(tenantId, filters);

      res.status(200).json({
        success: true,
        data: docs,
      });
    } catch (error: any) {
      logger.error('Error fetching financial documents:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch financial documents',
      });
    }
  }
}

export const financialDocumentController = new FinancialDocumentController();
