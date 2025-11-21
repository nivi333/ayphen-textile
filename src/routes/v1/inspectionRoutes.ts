import { Router } from 'express';
import { inspectionController } from '../../controllers/inspectionController';
import { tenantIsolationMiddleware, requireRole } from '../../middleware/tenantIsolation';

const router = Router();

// Apply tenant isolation middleware to all routes
router.use(tenantIsolationMiddleware);

// Inspection Routes
router.post(
  '/inspections',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  (req, res) => inspectionController.createInspection(req, res)
);

router.get(
  '/inspections',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  (req, res) => inspectionController.getInspections(req, res)
);

router.get(
  '/inspections/:inspectionId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  (req, res) => inspectionController.getInspectionById(req, res)
);

router.put(
  '/inspections/:inspectionId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  (req, res) => inspectionController.updateInspection(req, res)
);

router.post(
  '/inspections/:inspectionId/complete',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  (req, res) => inspectionController.completeInspection(req, res)
);

router.delete(
  '/inspections/:inspectionId',
  requireRole(['OWNER', 'ADMIN']),
  (req, res) => inspectionController.deleteInspection(req, res)
);

// Checkpoint Routes
router.put(
  '/checkpoints/:checkpointId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  (req, res) => inspectionController.updateCheckpoint(req, res)
);

// Template Routes
router.post(
  '/templates',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  (req, res) => inspectionController.createTemplate(req, res)
);

router.get(
  '/templates',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  (req, res) => inspectionController.getTemplates(req, res)
);

router.get(
  '/templates/:templateId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']),
  (req, res) => inspectionController.getTemplateById(req, res)
);

router.delete(
  '/templates/:templateId',
  requireRole(['OWNER', 'ADMIN']),
  (req, res) => inspectionController.deleteTemplate(req, res)
);

// Metrics Routes
router.get(
  '/metrics',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  (req, res) => inspectionController.getMetrics(req, res)
);

export default router;
