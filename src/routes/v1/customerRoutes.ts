import { Router } from 'express';
import { customerController } from '../../controllers/customerController';
import { requireRole } from '../../middleware/tenantIsolation';

const router = Router({ mergeParams: true });

/**
 * Customer Management Routes
 * Mounted at /companies/:tenantId/customers
 */

// Get all customers
router.get('/', customerController.getCustomers.bind(customerController));

// Create new customer
router.post('/',
    requireRole(['OWNER', 'ADMIN', 'MANAGER']),
    customerController.createCustomer.bind(customerController)
);

// Get customer details
router.get('/:id', customerController.getCustomerById.bind(customerController));

// Update customer
router.put('/:id',
    requireRole(['OWNER', 'ADMIN', 'MANAGER']),
    customerController.updateCustomer.bind(customerController)
);

// Delete customer
router.delete('/:id',
    requireRole(['OWNER', 'ADMIN']),
    customerController.deleteCustomer.bind(customerController)
);

export default router;
