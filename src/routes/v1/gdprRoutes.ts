import { Router } from 'express';
import gdprController from '../../controllers/gdprController';

const router = Router();

// POST /api/v1/gdpr/consent
router.post('/consent', gdprController.recordConsent);

// GET /api/v1/gdpr/export
router.get('/export', gdprController.exportData);

// DELETE /api/v1/gdpr/delete
router.delete('/delete', gdprController.deleteAccount);

export default router;
