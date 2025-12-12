import { Router } from 'express';
import auditController from '../../controllers/auditController';

const router = Router();

// GET /api/v1/audit-logs
router.get('/', auditController.getLogs);

export default router;
