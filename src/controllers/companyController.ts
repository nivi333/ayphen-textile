import { Request, Response } from 'express';
import { companyService } from '../services/companyService';
import { AuthService } from '../services/authService';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import Joi from 'joi';

// Validation schemas
const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .optional(),
  industry: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  logoUrl: Joi.string().max(3000000).optional(), // Allow up to ~3MB for base64 encoded 2MB images
  country: Joi.string().max(100).optional(),
  locationName: Joi.string().min(1).max(255).required(),
  address1: Joi.string().min(1).max(255).required(),
  address2: Joi.string().max(255).allow('').optional(),
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  pincode: Joi.string().min(1).max(20).required(),
  establishedDate: Joi.date().optional(),
  businessType: Joi.string().max(100).required(),
  certifications: Joi.string().max(500).optional(),
  contactInfo: Joi.string().min(1).max(100).required(),
  website: Joi.string().max(255).optional(),
  taxId: Joi.string().max(50).optional(),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9-]+$/)
    .optional(),
  industry: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  logoUrl: Joi.string().max(3000000).optional(), // Allow up to ~3MB for base64 encoded 2MB images
  country: Joi.string().max(100).optional(),
  defaultLocation: Joi.string().min(1).max(255).optional(),
});

const inviteUserSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').required(),
});

export class CompanyController {
  /**
   * Create a new company
   * POST /api/v1/companies
   */
  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createCompanySchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const userId = req.userId!;
      const { locationName, ...companyPayload } = value;

      const company = await companyService.createCompany(userId, {
        ...companyPayload,
        defaultLocationName: locationName,
      });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: company,
      });
    } catch (error: any) {
      logger.error('Error creating company:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create company',
      });
    }
  }

  /**
   * Get all companies for the authenticated user
   * GET /api/v1/companies
   */
  async getUserCompanies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const companies = await companyService.getUserCompanies(userId);

      res.json({
        success: true,
        data: companies,
      });
    } catch (error: any) {
      logger.error('Error fetching user companies:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch companies',
      });
    }
  }

  /**
   * Get company details by ID
   * GET /api/v1/companies/:tenantId
   */
  async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { tenantId } = req.params;

      const company = await companyService.getCompanyById(userId, tenantId);

      res.json({
        success: true,
        data: company,
      });
    } catch (error: any) {
      logger.error('Error fetching company details:', error);
      const statusCode = error.message === 'Access denied to company' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch company details',
      });
    }
  }

  /**
   * Switch company context
   * POST /api/v1/companies/:tenantId/switch
   */
  async switchCompany(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { tenantId } = req.params;

      const result = await companyService.switchCompany(userId, tenantId);

      // Regenerate tokens with tenant context
      const sessionId = uuidv4();
      const tokens = await AuthService.createSession({
        userId,
        sessionId,
        tenantId,
        userAgent: req.headers['user-agent'] as string,
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Company context switched successfully',
        data: {
          company: result.tenant,
          role: result.role,
          tokens,
        },
      });
    } catch (error: any) {
      logger.error('Error switching company:', error);
      const statusCode = error.message === 'Access denied to company' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to switch company',
      });
    }
  }

  /**
   * Update company details
   * PUT /api/v1/companies/:tenantId
   */
  async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = updateCompanySchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const userId = req.userId!;
      const { tenantId } = req.params;

      const company = await companyService.updateCompany(userId, tenantId, value);

      res.json({
        success: true,
        message: 'Company updated successfully',
        data: company,
      });
    } catch (error: any) {
      logger.error('Error updating company:', error);
      const statusCode =
        error.message === 'Insufficient permissions to update company'
          ? 403
          : error.message === 'Company slug already exists'
            ? 409
            : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update company',
      });
    }
  }

  /**
   * Invite user to company
   * POST /api/v1/companies/:tenantId/invite
   */
  async inviteUser(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = inviteUserSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(d => d.message),
        });
        return;
      }

      const userId = req.userId!;
      const { tenantId } = req.params;
      const { email, role } = value;

      const invitation = await companyService.inviteUser(userId, tenantId, email, role);

      res.status(201).json({
        success: true,
        message: 'User invited successfully',
        data: invitation,
      });
    } catch (error: any) {
      logger.error('Error inviting user:', error);
      const statusCode =
        error.message === 'Insufficient permissions to invite users'
          ? 403
          : error.message === 'User not found'
            ? 404
            : error.message === 'User is already part of this company'
              ? 409
              : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to invite user',
      });
    }
  }

  /**
   * Check if company slug is available
   * GET /api/v1/companies/check-slug?slug=example
   */
  async checkSlugAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.query;

      if (!slug || typeof slug !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Slug parameter is required',
        });
        return;
      }

      const isAvailable = await companyService.checkSlugAvailability(slug);

      res.json({
        success: true,
        available: isAvailable,
      });
    } catch (error: any) {
      logger.error('Error checking slug availability:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check slug availability',
      });
    }
  }

  /**
   * Delete (deactivate) company - OWNER only
   * DELETE /api/v1/companies/:tenantId
   */
  async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { tenantId } = req.params;

      await companyService.deleteCompany(userId, tenantId);

      res.json({
        success: true,
        message: 'Company deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting company:', error);
      const statusCode = error.message === 'Insufficient permissions to delete company' ? 403 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete company',
      });
    }
  }
}

export const companyController = new CompanyController();
