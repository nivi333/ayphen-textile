import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { tenantIsolationMiddleware } from '../middleware/tenantIsolation';

const router = Router();

// Public routes (no authentication required)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.get('/health', AuthController.healthCheck);

// Protected routes (authentication required)
router.use(tenantIsolationMiddleware); // Apply authentication middleware

router.post('/switch-tenant', AuthController.switchTenant);
router.get('/companies', AuthController.getUserCompanies);
router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);

// Session management routes
router.get('/sessions', AuthController.getUserSessions);
router.delete('/sessions/:sessionId', AuthController.revokeSession);
router.delete('/sessions', AuthController.revokeAllSessions);

export default router;
