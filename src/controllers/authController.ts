import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthService, LoginCredentials, RegisterData } from '@/services/authService';
import { logger } from '@/utils/logger';
import { migrationManager } from '@/database/migrations';

// Helper function to validate request and send error response
const validateRequest = (schema: Joi.ObjectSchema, data: any, res: Response): any => {
  const { error, value } = schema.validate(data);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message })),
    });
    return null;
  }
  return value;
};

// Helper to extract token from auth header
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
};

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
}).custom((value, helpers) => {
  if (!value.email && !value.phone) {
    return helpers.error('any.custom', { message: 'Either email or phone is required' });
  }
  return value;
});

const loginSchema = Joi.object({
  emailOrPhone: Joi.string().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const switchTenantSchema = Joi.object({
  tenantId: Joi.string().uuid().required(),
});

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(registerSchema, req.body, res);
      if (!value) return;

      const registerData: RegisterData = {
        ...value,
        deviceInfo: req.get('User-Agent'),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      };

      const result = await AuthService.register(registerData);
      logger.info(`User registered: ${result.user.id}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      const status = error.message.includes('already exists') ? 409 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(loginSchema, req.body, res);
      if (!value) return;

      const loginCredentials: LoginCredentials = {
        ...value,
        deviceInfo: req.get('User-Agent'),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      };

      const result = await AuthService.login(loginCredentials);
      logger.info(`User logged in: ${result.user.id}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      const status = error.message.includes('Invalid credentials') ? 401 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(refreshTokenSchema, req.body, res);
      if (!value) return;

      const tokens = await AuthService.refreshToken(value.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        tokens,
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      const status = error.message.includes('Invalid') || error.message.includes('expired') ? 401 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Switch tenant context
   */
  static async switchTenant(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(switchTenantSchema, req.body, res);
      if (!value) return;

      if (!req.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const token = extractToken(req);
      if (!token) {
        res.status(401).json({ success: false, message: 'Authorization header required' });
        return;
      }

      const decoded = AuthService.verifyToken(token, 'access');
      const tokens = await AuthService.switchTenant(req.userId, value.tenantId, decoded.sessionId);
      const userTenants = await migrationManager.getUserTenants(req.userId);
      const selectedTenant = userTenants.find(t => t.id === value.tenantId);

      logger.info(`Tenant switched: ${req.userId} -> ${value.tenantId}`);

      res.status(200).json({
        success: true,
        message: 'Tenant switched successfully',
        tokens,
        tenant: selectedTenant,
      });
    } catch (error: any) {
      logger.error('Tenant switch error:', error);
      const status = error.message.includes('Access denied') ? 403 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Tenant switch failed',
      });
    }
  }

  /**
   * Get user's companies/tenants
   */
  static async getUserCompanies(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const tenants = await migrationManager.getUserTenants(req.userId);
      res.status(200).json({ success: true, companies: tenants });
    } catch (error: any) {
      logger.error('Get user companies error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve companies' });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = extractToken(req);
      if (!token) {
        res.status(400).json({ success: false, message: 'Authorization header required' });
        return;
      }

      const decoded = AuthService.verifyToken(token, 'access');
      await AuthService.logout(decoded.sessionId);
      logger.info(`User logged out: ${decoded.userId}`);

      res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const sessions = await AuthService.getUserSessions(req.userId);
      res.status(200).json({ success: true, sessions });
    } catch (error: any) {
      logger.error('Get user sessions error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve sessions' });
    }
  }

  /**
   * Revoke session
   */
  static async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      if (!sessionId) {
        res.status(400).json({ success: false, message: 'Session ID is required' });
        return;
      }

      await AuthService.revokeSession(sessionId);
      logger.info(`Session revoked: ${sessionId}`);

      res.status(200).json({ success: true, message: 'Session revoked successfully' });
    } catch (error: any) {
      logger.error('Revoke session error:', error);
      res.status(500).json({ success: false, message: 'Failed to revoke session' });
    }
  }

  /**
   * Revoke all user sessions except current
   */
  static async revokeAllSessions(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      let currentSessionId: string | undefined;
      const token = extractToken(req);
      if (token) {
        try {
          const decoded = AuthService.verifyToken(token, 'access');
          currentSessionId = decoded.sessionId;
        } catch (error) {
          // If token is invalid, revoke all sessions
        }
      }

      await AuthService.revokeAllUserSessions(req.userId, currentSessionId);
      logger.info(`All sessions revoked for user: ${req.userId}`);

      res.status(200).json({ success: true, message: 'All sessions revoked successfully' });
    } catch (error: any) {
      logger.error('Revoke all sessions error:', error);
      res.status(500).json({ success: false, message: 'Failed to revoke sessions' });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      res.status(200).json({
        success: true,
        user: { id: req.userId },
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
    }
  }

  /**
   * Health check for authentication service
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        status: { timestamp: new Date().toISOString() },
      });
    } catch (error: any) {
      logger.error('Auth health check error:', error);
      res.status(503).json({ success: false, message: 'Service unhealthy' });
    }
  }
}
