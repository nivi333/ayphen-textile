import { Request, Response } from 'express';
import { customerService } from '../services/customerService';
import { logger } from '../utils/logger';
import Joi from 'joi';

const createCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  customerType: Joi.string()
    .valid('INDIVIDUAL', 'BUSINESS', 'DISTRIBUTOR', 'RETAILER', 'WHOLESALER')
    .optional(),
  companyName: Joi.when('customerType', {
    is: Joi.string().valid('BUSINESS'),
    then: Joi.string().min(2).max(100).required(),
    otherwise: Joi.string().max(100).optional(),
  }),
  customerCategory: Joi.string().valid('VIP', 'REGULAR', 'NEW', 'INACTIVE').optional(),
  primaryContactPerson: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number with country code',
    }),
  alternatePhone: Joi.string()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid phone number with country code',
    }),
  website: Joi.string().uri().optional().allow(''),
  // Billing Address
  billingAddressLine1: Joi.string().max(255).optional().allow(''),
  billingAddressLine2: Joi.string().max(255).optional().allow(''),
  billingCity: Joi.string().max(100).required(),
  billingState: Joi.string().max(100).optional().allow(''),
  billingCountry: Joi.string().max(100).required(),
  billingPostalCode: Joi.string().max(20).optional().allow(''),
  // Shipping Address
  shippingAddressLine1: Joi.string().max(255).optional().allow(''),
  shippingAddressLine2: Joi.string().max(255).optional().allow(''),
  shippingCity: Joi.string().max(100).optional().allow(''),
  shippingState: Joi.string().max(100).optional().allow(''),
  shippingCountry: Joi.string().max(100).optional().allow(''),
  shippingPostalCode: Joi.string().max(20).optional().allow(''),
  sameAsBillingAddress: Joi.boolean().default(true),
  // Financial Information
  paymentTerms: Joi.string()
    .valid('NET_30', 'NET_60', 'NET_90', 'ADVANCE', 'COD', 'CREDIT')
    .optional(),
  creditLimit: Joi.number().min(0).precision(2).optional(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
  taxId: Joi.string().max(50).optional().allow(''),
  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid PAN number (e.g., ABCDE1234F)',
    }),
  // Additional Information
  assignedSalesRep: Joi.string().uuid().optional().allow(''),
  notes: Joi.string().max(500).optional().allow(''),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  isActive: Joi.boolean().default(true),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  customerType: Joi.string()
    .valid('INDIVIDUAL', 'BUSINESS', 'DISTRIBUTOR', 'RETAILER', 'WHOLESALER')
    .optional(),
  companyName: Joi.when('customerType', {
    is: Joi.string().valid('BUSINESS'),
    then: Joi.string().min(2).max(100).required(),
    otherwise: Joi.string().max(100).optional(),
  }),
  customerCategory: Joi.string().valid('VIP', 'REGULAR', 'NEW', 'INACTIVE').optional(),
  primaryContactPerson: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid phone number with country code',
    }),
  alternatePhone: Joi.string()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid phone number with country code',
    }),
  website: Joi.string().uri().optional().allow(''),
  // Billing Address
  billingAddressLine1: Joi.string().max(255).optional().allow(''),
  billingAddressLine2: Joi.string().max(255).optional().allow(''),
  billingCity: Joi.string().max(100).optional().allow(''),
  billingState: Joi.string().max(100).optional().allow(''),
  billingCountry: Joi.string().max(100).optional().allow(''),
  billingPostalCode: Joi.string().max(20).optional().allow(''),
  // Shipping Address
  shippingAddressLine1: Joi.string().max(255).optional().allow(''),
  shippingAddressLine2: Joi.string().max(255).optional().allow(''),
  shippingCity: Joi.string().max(100).optional().allow(''),
  shippingState: Joi.string().max(100).optional().allow(''),
  shippingCountry: Joi.string().max(100).optional().allow(''),
  shippingPostalCode: Joi.string().max(20).optional().allow(''),
  sameAsBillingAddress: Joi.boolean().optional(),
  // Financial Information
  paymentTerms: Joi.string()
    .valid('NET_30', 'NET_60', 'NET_90', 'ADVANCE', 'COD', 'CREDIT')
    .optional(),
  creditLimit: Joi.number().min(0).precision(2).optional(),
  currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').optional(),
  taxId: Joi.string().max(50).optional().allow(''),
  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid PAN number (e.g., ABCDE1234F)',
    }),
  // Additional Information
  assignedSalesRep: Joi.string().uuid().optional().allow(''),
  notes: Joi.string().max(500).optional().allow(''),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  isActive: Joi.boolean().optional(),
});

export class CustomerController {
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const { error, value } = createCustomerSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const customer = await customerService.createCustomer({
        companyId: tenantId,
        ...value,
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error: any) {
      logger.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create customer',
      });
    }
  }

  async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const {
        search,
        customerType,
        customerCategory,
        isActive,
        paymentTerms,
        currency,
        assignedSalesRep,
        page,
        limit,
      } = req.query;

      const filters = {
        search: search as string,
        customerType: customerType as string,
        customerCategory: customerCategory as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        paymentTerms: paymentTerms as string,
        currency: currency as string,
        assignedSalesRep: assignedSalesRep as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };

      const result = await customerService.getCustomers(tenantId, filters);

      res.json({
        success: true,
        data: result.customers,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Error fetching customers:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch customers',
      });
    }
  }

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId, id } = req.params;
      const customer = await customerService.getCustomerById(tenantId, id);

      res.json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      logger.error('Error fetching customer:', error);
      const statusCode = error.message === 'Customer not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch customer',
      });
    }
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId, id } = req.params;
      const { error, value } = updateCustomerSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const customer = await customerService.updateCustomer(id, {
        companyId: tenantId,
        ...value,
      });

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error: any) {
      logger.error('Error updating customer:', error);
      const statusCode = error.message === 'Customer not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update customer',
      });
    }
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId, id } = req.params;
      await customerService.deleteCustomer(tenantId, id);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting customer:', error);
      const statusCode = error.message === 'Customer not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete customer',
      });
    }
  }
}

export const customerController = new CustomerController();
