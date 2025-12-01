import { Router } from 'express';
import { invoiceController } from '../../controllers/invoiceController';
import { requireRole } from '../../middleware/tenantIsolation';

const router = Router();

// List invoices for current tenant
router.get('/', invoiceController.getInvoices.bind(invoiceController));

// Create new invoice (OWNER/ADMIN/MANAGER)
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  invoiceController.createInvoice.bind(invoiceController),
);

// Create invoice from Sales Order (OWNER/ADMIN/MANAGER)
router.post(
  '/from-order',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  invoiceController.createInvoiceFromOrder.bind(invoiceController),
);

// Get invoice by ID
router.get('/:invoiceId', invoiceController.getInvoiceById.bind(invoiceController));

// Update invoice (OWNER/ADMIN/MANAGER)
router.put(
  '/:invoiceId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  invoiceController.updateInvoice.bind(invoiceController),
);

// Update invoice status (OWNER/ADMIN/MANAGER)
router.patch(
  '/:invoiceId/status',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  invoiceController.updateInvoiceStatus.bind(invoiceController),
);

// Delete invoice (soft delete) (OWNER/ADMIN)
// Note: Only DRAFT invoices can be deleted
router.delete(
  '/:invoiceId',
  requireRole(['OWNER', 'ADMIN']),
  invoiceController.deleteInvoice.bind(invoiceController),
);

export default router;
