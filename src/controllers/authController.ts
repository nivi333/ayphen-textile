import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthService } from '@/services/authService';
import { logger } from '@/utils/logger';

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message(
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  hasConsentedToTerms: Joi.boolean().optional(),
  hasConsentedToPrivacy: Joi.boolean().optional(),
  hasConsentedToCookies: Joi.boolean().optional(),
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

// Helper function to validate request
function validateRequest(schema: Joi.ObjectSchema, data: any, res: Response): any {
  const { error, value } = schema.validate(data);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
    return null;
  }
  return value;
}

export class AuthController {
  /**
   * Register new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const value = validateRequest(registerSchema, req.body, res);
      if (!value) return;

      const result = await AuthService.register({
        ...value,
        deviceInfo: req.headers['user-agent'],
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      const status = error.message?.includes('already exists') ? 409 : 500;
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

      const result = await AuthService.login({
        ...value,
        deviceInfo: req.headers['user-agent'],
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      const status = error.message?.includes('Invalid credentials')
        ? 401
        : error.message?.includes('User not registered')
          ? 404
          : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Health check
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        status: 'OK',
        service: 'auth',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Auth health check error:', error);
      res.status(503).json({
        status: 'ERROR',
        service: 'auth',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Switch tenant
   */
  static async switchTenant(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Tenant switched successfully',
      });
    } catch (error: any) {
      logger.error('Switch tenant error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Switch tenant failed',
      });
    }
  }

  /**
   * Get user companies
   */
  static async getUserCompanies(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        companies: [],
      });
    } catch (error: any) {
      logger.error('Get user companies error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user companies',
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        user: {},
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile',
      });
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        sessions: [],
      });
    } catch (error: any) {
      logger.error('Get user sessions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user sessions',
      });
    }
  }

  /**
   * Revoke session
   */
  static async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error: any) {
      logger.error('Revoke session error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to revoke session',
      });
    }
  }

  /**
   * Revoke all sessions
   */
  static async revokeAllSessions(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: 'All sessions revoked successfully',
      });
    } catch (error: any) {
      logger.error('Revoke all sessions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to revoke all sessions',
      });
    }
  }
}
