import { Request, Response } from 'express';
import Joi from 'joi';
import { orderService } from '../services/orderService';
import { logger } from '../utils/logger';
import { ListOrderFilters } from '../types';

const createOrderSchema = Joi.object({
  customerName: Joi.string().min(1).max(255).required(),
  customerCode: Joi.string().max(100).optional(),
  orderDate: Joi.date().required(),
  deliveryDate: Joi.date().min(Joi.ref('orderDate')).optional(),
  currency: Joi.string().max(10).optional(),
  notes: Joi.string().max(1000).optional(),
  locationId: Joi.string().optional(),
  shippingCarrier: Joi.string().max(255).optional(),
  trackingNumber: Joi.string().max(255).optional(),
  shippingMethod: Joi.string().max(255).optional(),
  deliveryWindowStart: Joi.date().optional(),
  deliveryWindowEnd: Joi.date().min(Joi.ref('deliveryWindowStart')).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        lineNumber: Joi.number().integer().min(1).optional(),
        itemCode: Joi.string().min(1).max(255).required(),
        description: Joi.string().max(500).allow('', null).optional(),
        quantity: Joi.number().greater(0).required(),
        unitOfMeasure: Joi.string().min(1).max(50).required(),
        unitPrice: Joi.number().min(0).required(),
      }),
    )
    .min(1)
    .required(),
});

const updateOrderSchema = Joi.object({
  customerName: Joi.string().min(1).max(255).optional(),
  customerCode: Joi.string().max(100).optional(),
  orderDate: Joi.date().optional(),
  deliveryDate: Joi.date().min(Joi.ref('orderDate')).optional(),
  currency: Joi.string().max(10).optional(),
  notes: Joi.string().max(1000).optional(),
  locationId: Joi.string().optional(),
  shippingCarrier: Joi.string().max(255).optional(),
  trackingNumber: Joi.string().max(255).optional(),
  shippingMethod: Joi.string().max(255).optional(),
  deliveryWindowStart: Joi.date().optional(),
  deliveryWindowEnd: Joi.date().min(Joi.ref('deliveryWindowStart')).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        lineNumber: Joi.number().integer().min(1).optional(),
        itemCode: Joi.string().min(1).max(255).required(),
        description: Joi.string().max(500).allow('', null).optional(),
        quantity: Joi.number().greater(0).required(),
        unitOfMeasure: Joi.string().min(1).max(50).required(),
        unitPrice: Joi.number().min(0).required(),
      }),
    )
    .min(1)
    .optional(),
}).min(1);

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED')
    .required(),
  deliveryDate: Joi.date().optional(),
  shippingCarrier: Joi.string().max(255).optional(),
  trackingNumber: Joi.string().max(255).optional(),
  shippingMethod: Joi.string().max(255).optional(),
  deliveryWindowStart: Joi.date().optional(),
  deliveryWindowEnd: Joi.date().min(Joi.ref('deliveryWindowStart')).optional(),
});

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createOrderSchema.validate(req.body);
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

      const order = await orderService.createOrder(tenantId, value);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to create order',
      });
    }
  }

  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      const filters: ListOrderFilters = {};

      const { status, from, to, customerName } = req.query;

      if (typeof status === 'string' && status.trim().length > 0) {
        filters.status = status;
      }

      if (typeof from === 'string') {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          filters.fromDate = fromDate;
        }
      }

      if (typeof to === 'string') {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          filters.toDate = toDate;
        }
      }

      if (typeof customerName === 'string' && customerName.trim().length > 0) {
        filters.customerName = customerName;
      }

      const orders = await orderService.getOrders(tenantId, filters);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error: any) {
      logger.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch orders',
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req;
      const { orderId } = req.params;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'orderId is required',
        });
        return;
      }

      const order = await orderService.getOrderById(tenantId, orderId);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      logger.error('Error fetching order by id:', error);

      if (error.message === 'Order not found') {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch order',
      });
    }
  }

  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = updateOrderSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const { tenantId } = req;
      const { orderId } = req.params;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'orderId is required',
        });
        return;
      }

      const order = await orderService.updateOrder(tenantId, orderId, value);

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error updating order:', error);

      if (error.message === 'Order not found') {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      if (error.message === 'Cannot update an order that is delivered or cancelled') {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to update order',
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = updateOrderStatusSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const { tenantId } = req;
      const { orderId } = req.params;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant context is required',
        });
        return;
      }

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'orderId is required',
        });
        return;
      }

      const {
        status,
        deliveryDate,
        shippingCarrier,
        trackingNumber,
        shippingMethod,
        deliveryWindowStart,
        deliveryWindowEnd,
      } = value;

      const order = await orderService.updateOrderStatus(tenantId, orderId, status as any, {
        deliveryDate,
        shippingCarrier,
        trackingNumber,
        shippingMethod,
        deliveryWindowStart,
        deliveryWindowEnd,
      });

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error: any) {
      logger.error('Error updating order status:', error);

      if (error.message === 'Order not found') {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      if (error.message === 'Invalid status transition') {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error?.message || 'Failed to update order status',
      });
    }
  }
}

export const orderController = new OrderController();
