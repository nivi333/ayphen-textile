import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { tenantIsolationMiddleware } from '@/middleware/tenantIsolation';
import { 
  authRateLimit, 
  registrationRateLimit, 
  passwordResetRateLimit,
  userRateLimit 
} from '@/middleware/rateLimiter';

const router = Router();

// Public routes (no authentication required)
router.post('/register', registrationRateLimit, AuthController.register);
router.post('/login', authRateLimit, AuthController.login);
router.post('/refresh', authRateLimit, AuthController.refreshToken);

// Protected routes (authentication required)
router.use(tenantIsolationMiddleware); // Apply authentication middleware

router.post('/switch-tenant', userRateLimit, AuthController.switchTenant);
router.get('/companies', userRateLimit, AuthController.getUserCompanies);
router.post('/logout', userRateLimit, AuthController.logout);
router.get('/profile', userRateLimit, AuthController.getProfile);

// Session management routes
router.get('/sessions', userRateLimit, AuthController.getUserSessions);
router.delete('/sessions/:sessionId', userRateLimit, AuthController.revokeSession);
router.delete('/sessions', userRateLimit, AuthController.revokeAllSessions);

export default router;
