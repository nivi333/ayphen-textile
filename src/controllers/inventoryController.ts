import { Request, Response } from 'express';
import Joi from 'joi';
import { inventoryService } from '../services/inventoryService';
import { logger } from '../utils/logger';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateLocationInventorySchema = Joi.object({
  productId: Joi.string().required(),
  locationId: Joi.string().required(),
  stockQuantity: Joi.number().min(0).required(),
  reservedQuantity: Joi.number().min(0).optional(),
  reorderLevel: Joi.number().min(0).optional(),
  maxStockLevel: Joi.number().min(0).optional(),
});

const stockMovementSchema = Joi.object({
  productId: Joi.string().required(),
  fromLocationId: Joi.string().optional(),
  toLocationId: Joi.string().optional(),
  movementType: Joi.string().valid(
    'PURCHASE', 'SALE', 'TRANSFER_IN', 'TRANSFER_OUT', 
    'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'PRODUCTION_IN', 
    'PRODUCTION_OUT', 'RETURN_IN', 'RETURN_OUT', 'DAMAGE'
  ).required(),
  quantity: Joi.number().min(0.001).required(),
  unitCost: Joi.number().min(0).optional(),
  referenceType: Joi.string().optional(),
  referenceId: Joi.string().optional(),
  notes: Joi.string().max(500).optional(),
});

const stockReservationSchema = Joi.object({
  productId: Joi.string().required(),
  locationId: Joi.string().required(),
  orderId: Joi.string().optional(),
  reservedQuantity: Joi.number().min(0.001).required(),
  reservationType: Joi.string().valid('ORDER', 'PRODUCTION', 'TRANSFER', 'MANUAL').required(),
  expiresAt: Joi.date().optional(),
  notes: Joi.string().max(500).optional(),
});

const inventoryFiltersSchema = Joi.object({
  locationId: Joi.string().optional(),
  productId: Joi.string().optional(),
  lowStock: Joi.boolean().optional(),
  outOfStock: Joi.boolean().optional(),
  search: Joi.string().max(255).optional(),
});

// ============================================
// CONTROLLER METHODS
// ============================================

/**
 * Get location inventory with filters
 */
export const getLocationInventory = async (req: Request, res: Response) => {
  try {
    const { error, value } = inventoryFiltersSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    const companyId = req.tenantId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company context is required',
      });
    }

    const inventory = await inventoryService.getLocationInventory(companyId, value);

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    logger.error('Error in getLocationInventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update location inventory
 */
export const updateLocationInventory = async (req: Request, res: Response) => {
  try {
    const { error, value } = updateLocationInventorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    const companyId = req.tenantId;
    const userId = req.userId;
    
    if (!companyId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Company context and user authentication are required',
      });
    }

    const inventory = await inventoryService.updateLocationInventory(companyId, value, userId);

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Error in updateLocationInventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Record stock movement
 */
export const recordStockMovement = async (req: Request, res: Response) => {
  try {
    const { error, value } = stockMovementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    const companyId = req.tenantId;
    const userId = req.userId;
    
    if (!companyId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Company context and user authentication are required',
      });
    }

    // Add user info to movement data
    const movementData = {
      ...value,
      createdBy: userId,
    };

    const movement = await inventoryService.recordStockMovement(companyId, movementData);

    res.json({
      success: true,
      message: 'Stock movement recorded successfully',
      data: movement,
    });
  } catch (error) {
    logger.error('Error in recordStockMovement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record stock movement',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create stock reservation
 */
export const createStockReservation = async (req: Request, res: Response) => {
  try {
    const { error, value } = stockReservationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message),
      });
    }

    const companyId = req.tenantId;
    const userId = req.userId;
    
    if (!companyId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Company context and user authentication are required',
      });
    }

    // Add user info to reservation data
    const reservationData = {
      ...value,
      createdBy: userId,
    };

    const reservation = await inventoryService.createStockReservation(companyId, reservationData);

    res.json({
      success: true,
      message: 'Stock reservation created successfully',
      data: reservation,
    });
  } catch (error) {
    logger.error('Error in createStockReservation:', error);
    
    // Handle specific business logic errors
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create stock reservation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Release stock reservation
 */
export const releaseStockReservation = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    
    if (!reservationId) {
      return res.status(400).json({
        success: false,
        message: 'Reservation ID is required',
      });
    }

    const companyId = req.tenantId;
    const userId = req.userId;
    
    if (!companyId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Company context and user authentication are required',
      });
    }

    const result = await inventoryService.releaseStockReservation(companyId, reservationId, userId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('Error in releaseStockReservation:', error);
    
    // Handle specific business logic errors
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to release stock reservation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get stock alerts
 */
export const getStockAlerts = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    // Validate status if provided
    const validStatuses = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'];
    if (status && !validStatuses.includes(status as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert status. Valid values: ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED',
      });
    }

    const companyId = req.tenantId;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company context is required',
      });
    }

    const alerts = await inventoryService.getStockAlerts(companyId, status as any);

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    logger.error('Error in getStockAlerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock alerts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Acknowledge stock alert
 */
export const acknowledgeStockAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    
    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: 'Alert ID is required',
      });
    }

    const companyId = req.tenantId;
    const userId = req.userId;
    
    if (!companyId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Company context and user authentication are required',
      });
    }

    const result = await inventoryService.acknowledgeStockAlert(companyId, alertId, userId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error('Error in acknowledgeStockAlert:', error);
    
    // Handle specific business logic errors
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge stock alert',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ============================================
// EXPORT DEFAULT CONTROLLER OBJECT
// ============================================

export default {
  getLocationInventory,
  updateLocationInventory,
  recordStockMovement,
  createStockReservation,
  releaseStockReservation,
  getStockAlerts,
  acknowledgeStockAlert,
};
