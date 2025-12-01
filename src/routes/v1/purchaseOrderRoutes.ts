import { Router } from 'express';
import { purchaseOrderController } from '../../controllers/purchaseOrderController';
import { requireRole } from '../../middleware/tenantIsolation';

const router = Router();

/**
 * Purchase Order Management Routes
 * All routes require authentication (handled by tenantIsolationMiddleware in parent router)
 */

// List purchase orders for current tenant
router.get('/', purchaseOrderController.getPurchaseOrders.bind(purchaseOrderController));

// Create new purchase order (OWNER/ADMIN/MANAGER)
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  purchaseOrderController.createPurchaseOrder.bind(purchaseOrderController),
);

// Get purchase order by poId
router.get('/:poId', purchaseOrderController.getPurchaseOrderById.bind(purchaseOrderController));

// Update purchase order details (OWNER/ADMIN/MANAGER)
router.put(
  '/:poId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  purchaseOrderController.updatePurchaseOrder.bind(purchaseOrderController),
);

// Update purchase order status (OWNER/ADMIN/MANAGER)
router.patch(
  '/:poId/status',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  purchaseOrderController.updatePOStatus.bind(purchaseOrderController),
);

// Delete purchase order (soft delete) (OWNER/ADMIN)
router.delete(
  '/:poId',
  requireRole(['OWNER', 'ADMIN']),
  purchaseOrderController.deletePurchaseOrder.bind(purchaseOrderController),
);

export default router;
