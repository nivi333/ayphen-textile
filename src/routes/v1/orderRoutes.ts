import { Router } from 'express';
import { orderController } from '../../controllers/orderController';
import { requireRole } from '../../middleware/tenantIsolation';

const router = Router();

/**
 * Order Management Routes
 * All routes require authentication (handled by tenantIsolationMiddleware in parent router)
 */

// List orders for current tenant
router.get('/', orderController.getOrders.bind(orderController));

// Create new order (OWNER/ADMIN/MANAGER)
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  orderController.createOrder.bind(orderController),
);

// Get order by orderId
router.get('/:orderId', orderController.getOrderById.bind(orderController));

// Update order details (OWNER/ADMIN/MANAGER)
router.put(
  '/:orderId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  orderController.updateOrder.bind(orderController),
);

// Update order status (OWNER/ADMIN/MANAGER)
router.patch(
  '/:orderId/status',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  orderController.updateOrderStatus.bind(orderController),
);

// Delete order (soft delete) (OWNER/ADMIN)
router.delete(
  '/:orderId',
  requireRole(['OWNER', 'ADMIN']),
  orderController.deleteOrder.bind(orderController),
);

export default router;
