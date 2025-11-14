import { Router } from 'express';
import { locationController } from '../../controllers/locationController';

const router = Router();

/**
 * Location Management Routes
 * All routes require authentication (handled by tenantIsolationMiddleware in parent router)
 */

// Get all locations for authenticated user
router.get('/', locationController.getUserLocations.bind(locationController));

// Create new location
router.post('/', locationController.createLocation.bind(locationController));

// Update location
router.put('/:locationId', locationController.updateLocation.bind(locationController));

// Delete location
router.delete('/:locationId', locationController.deleteLocation.bind(locationController));

export default router;
