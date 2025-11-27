import { Request, Response } from 'express';
import { customerService } from '../services/customerService';
import { logger } from '../utils/logger';
import Joi from 'joi';

const createCustomerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    customerType: Joi.string().optional(),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().max(20).optional().allow(''),
    addressLine1: Joi.string().max(255).optional().allow(''),
    addressLine2: Joi.string().max(255).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    state: Joi.string().max(100).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    pincode: Joi.string().max(20).optional().allow(''),
    taxId: Joi.string().max(50).optional().allow(''),
    creditLimit: Joi.number().min(0).optional(),
    paymentTerms: Joi.string().max(100).optional().allow(''),
    isActive: Joi.boolean().optional().default(true),
});

const updateCustomerSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    customerType: Joi.string().optional(),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().max(20).optional().allow(''),
    addressLine1: Joi.string().max(255).optional().allow(''),
    addressLine2: Joi.string().max(255).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    state: Joi.string().max(100).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    pincode: Joi.string().max(20).optional().allow(''),
    taxId: Joi.string().max(50).optional().allow(''),
    creditLimit: Joi.number().min(0).optional(),
    paymentTerms: Joi.string().max(100).optional().allow(''),
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
            const { search, type, isActive, page, limit } = req.query;

            const filters = {
                search: search as string,
                type: type as string,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
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

            const customer = await customerService.updateCustomer(tenantId, id, value);

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
