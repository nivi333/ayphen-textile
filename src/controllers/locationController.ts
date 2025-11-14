import { Request, Response } from 'express';
import { locationService } from '../services/locationService';
import Joi from 'joi';
import { logger } from '../utils/logger';

// Validation schemas
const createLocationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  country: Joi.string().max(100).required(),
  addressLine1: Joi.string().min(1).max(255).required(),
  addressLine2: Joi.string().max(255).optional(),
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  pincode: Joi.string().min(1).max(20).required(),
  locationType: Joi.string().valid('HEADQUARTERS', 'BRANCH', 'WAREHOUSE', 'FACTORY').optional(),
  isDefault: Joi.boolean().optional(),
  isHeadquarters: Joi.boolean().optional(),
});

const updateLocationSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  country: Joi.string().max(100).optional(),
  addressLine1: Joi.string().min(1).max(255).optional(),
  addressLine2: Joi.string().max(255).optional(),
  city: Joi.string().min(1).max(100).optional(),
  state: Joi.string().min(1).max(100).optional(),
  pincode: Joi.string().min(1).max(20).optional(),
  locationType: Joi.string().valid('HEADQUARTERS', 'BRANCH', 'WAREHOUSE', 'FACTORY').optional(),
  isDefault: Joi.boolean().optional(),
  isHeadquarters: Joi.boolean().optional(),
});

// Helper function to validate request
function validateRequest(schema: Joi.ObjectSchema, data: any, res: Response): any {
  const { error, value } = schema.validate(data);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
    return null;
  }
  return value;
}

export class LocationController {
  /**
   * Get all locations for the authenticated user
   * GET /api/v1/locations
   */
  async getUserLocations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const locations = await locationService.getUserLocations(userId);

      res.json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      logger.error('Error fetching user locations:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch locations',
      });
    }
  }

  /**
   * Create a new location
   * POST /api/v1/locations
   */
  async createLocation(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(createLocationSchema, req.body, res);
      if (!value) return;

      const userId = req.userId!;
      const location = await locationService.createLocation(userId, value);

      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        data: location,
      });
    } catch (error: any) {
      logger.error('Error creating location:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create location',
      });
    }
  }

  /**
   * Update a location
   * PUT /api/v1/locations/:locationId
   */
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(updateLocationSchema, req.body, res);
      if (!value) return;

      const userId = req.userId!;
      const { locationId } = req.params;

      const location = await locationService.updateLocation(userId, locationId, value);

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: location,
      });
    } catch (error: any) {
      logger.error('Error updating location:', error);
      const statusCode = error.message === 'Location not found or access denied' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update location',
      });
    }
  }

  /**
   * Delete a location
   * DELETE /api/v1/locations/:locationId
   */
  async deleteLocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { locationId } = req.params;

      await locationService.deleteLocation(userId, locationId);

      res.json({
        success: true,
        message: 'Location deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting location:', error);
      const statusCode = error.message === 'Location not found or access denied' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete location',
      });
    }
  }
}

export const locationController = new LocationController();
