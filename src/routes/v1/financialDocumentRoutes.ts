import { Router } from 'express';
import { financialDocumentController } from '../../controllers/financialDocumentController';
import { requireRole } from '../../middleware/tenantIsolation';

const router = Router();

/**
 * Financial Documents Routes
 * All routes require authentication (handled by tenantIsolationMiddleware in parent router)
 */

// List financial documents
router.get('/', requireRole(['OWNER', 'ADMIN', 'MANAGER']), financialDocumentController.getFinancialDocuments.bind(financialDocumentController));

// Create invoice for order
router.post(
  '/invoices/from-order',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  financialDocumentController.createInvoiceForOrder.bind(financialDocumentController),
);

// Create bill (head-office based)
router.post(
  '/bills',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  financialDocumentController.createBill.bind(financialDocumentController),
);

// Create purchase order (location-based)
router.post(
  '/purchase-orders',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  financialDocumentController.createPurchaseOrder.bind(financialDocumentController),
);

export default router;
