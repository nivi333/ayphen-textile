import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/middleware/enhancedErrorHandler';

// Common validation patterns
export const ValidationPatterns = {
  email: Joi.string().email().max(255),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  uuid: Joi.string().uuid(),
  name: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\s'-]+$/),
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/),
  url: Joi.string().uri(),
  positiveInteger: Joi.number().integer().positive(),
  nonNegativeInteger: Joi.number().integer().min(0),
  decimal: Joi.number().precision(2),
  dateString: Joi.string().isoDate(),
  timezone: Joi.string().valid(...Intl.supportedValuesOf('timeZone')),
  locale: Joi.string().pattern(/^[a-z]{2}(-[A-Z]{2})?$/),
  currency: Joi.string().length(3).uppercase(),
};

// Authentication schemas
export const AuthSchemas = {
  register: Joi.object({
    firstName: ValidationPatterns.name.required(),
    lastName: ValidationPatterns.name.required(),
    email: ValidationPatterns.email.optional(),
    phone: ValidationPatterns.phone.optional(),
    password: ValidationPatterns.password.required(),
  }).custom((value, helpers) => {
    if (!value.email && !value.phone) {
      return helpers.error('any.custom', { message: 'Either email or phone is required' });
    }
    return value;
  }),

  login: Joi.object({
    emailOrPhone: Joi.string().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  switchTenant: Joi.object({
    tenantId: ValidationPatterns.uuid.required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: ValidationPatterns.password.required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')),
  }),

  resetPassword: Joi.object({
    email: ValidationPatterns.email.required(),
  }),

  confirmResetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: ValidationPatterns.password.required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')),
  }),
};

// User schemas
export const UserSchemas = {
  updateProfile: Joi.object({
    firstName: ValidationPatterns.name.optional(),
    lastName: ValidationPatterns.name.optional(),
    email: ValidationPatterns.email.optional(),
    phone: ValidationPatterns.phone.optional(),
    timezone: ValidationPatterns.timezone.optional(),
    locale: ValidationPatterns.locale.optional(),
  }),

  updatePreferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    language: ValidationPatterns.locale.optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
    }).optional(),
    dateFormat: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD').optional(),
    timeFormat: Joi.string().valid('12', '24').optional(),
    currency: ValidationPatterns.currency.optional(),
  }),
};

// Company schemas
export const CompanySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    industry: Joi.string().max(50).optional(),
    website: ValidationPatterns.url.optional(),
    email: ValidationPatterns.email.optional(),
    phone: ValidationPatterns.phone.optional(),
    address: Joi.object({
      line1: Joi.string().max(100).required(),
      line2: Joi.string().max(100).optional(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      pincode: Joi.string().max(10).required(),
      country: Joi.string().length(2).uppercase().required(),
    }).required(),
    settings: Joi.object({
      timezone: ValidationPatterns.timezone.optional(),
      currency: ValidationPatterns.currency.optional(),
      fiscalYearStart: Joi.string().pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).optional(),
    }).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    industry: Joi.string().max(50).optional(),
    website: ValidationPatterns.url.optional(),
    email: ValidationPatterns.email.optional(),
    phone: ValidationPatterns.phone.optional(),
    address: Joi.object({
      line1: Joi.string().max(100).optional(),
      line2: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      pincode: Joi.string().max(10).optional(),
      country: Joi.string().length(2).uppercase().optional(),
    }).optional(),
    settings: Joi.object({
      timezone: ValidationPatterns.timezone.optional(),
      currency: ValidationPatterns.currency.optional(),
      fiscalYearStart: Joi.string().pattern(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/).optional(),
    }).optional(),
  }),

  inviteUser: Joi.object({
    email: ValidationPatterns.email.required(),
    role: Joi.string().valid('ADMIN', 'MANAGER', 'EMPLOYEE').required(),
    message: Joi.string().max(500).optional(),
  }),
};

// Location schemas
export const LocationSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid('WAREHOUSE', 'FACTORY', 'OFFICE', 'STORE').required(),
    description: Joi.string().max(500).optional(),
    address: Joi.object({
      line1: Joi.string().max(100).required(),
      line2: Joi.string().max(100).optional(),
      city: Joi.string().max(50).required(),
      state: Joi.string().max(50).required(),
      pincode: Joi.string().max(10).required(),
      country: Joi.string().length(2).uppercase().required(),
    }).required(),
    contact: Joi.object({
      email: ValidationPatterns.email.optional(),
      phone: ValidationPatterns.phone.optional(),
      manager: Joi.string().max(100).optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    type: Joi.string().valid('WAREHOUSE', 'FACTORY', 'OFFICE', 'STORE').optional(),
    description: Joi.string().max(500).optional(),
    address: Joi.object({
      line1: Joi.string().max(100).optional(),
      line2: Joi.string().max(100).optional(),
      city: Joi.string().max(50).optional(),
      state: Joi.string().max(50).optional(),
      pincode: Joi.string().max(10).optional(),
      country: Joi.string().length(2).uppercase().optional(),
    }).optional(),
    contact: Joi.object({
      email: ValidationPatterns.email.optional(),
      phone: ValidationPatterns.phone.optional(),
      manager: Joi.string().max(100).optional(),
    }).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

// Query parameter schemas
export const QuerySchemas = {
  pagination: Joi.object({
    page: ValidationPatterns.positiveInteger.default(1),
    limit: ValidationPatterns.positiveInteger.max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  search: Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    filters: Joi.object().optional(),
    dateFrom: ValidationPatterns.dateString.optional(),
    dateTo: ValidationPatterns.dateString.optional(),
  }),

  export: Joi.object({
    format: Joi.string().valid('csv', 'xlsx', 'pdf').default('csv'),
    fields: Joi.array().items(Joi.string()).optional(),
    dateFrom: ValidationPatterns.dateString.optional(),
    dateTo: ValidationPatterns.dateString.optional(),
  }),
};

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      const validationError = new ValidationError('Validation failed', details, req.requestId);
      return next(validationError);
    }

    // Replace the original data with validated and sanitized data
    if (source === 'body') {
      req.body = value;
    } else if (source === 'query') {
      req.query = value;
    } else {
      req.params = value;
    }

    next();
  };
};

/**
 * Conditional validation middleware
 */
export const validateIf = (
  condition: (req: Request) => boolean,
  schema: Joi.ObjectSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (condition(req)) {
      return validate(schema, source)(req, res, next);
    }
    next();
  };
};

/**
 * Multi-source validation middleware
 */
export const validateMultiple = (validations: Array<{
  schema: Joi.ObjectSchema;
  source: 'body' | 'query' | 'params';
}>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: any[] = [];

    for (const validation of validations) {
      const data = validation.source === 'body' ? req.body : 
                   validation.source === 'query' ? req.query : req.params;
      
      const { error, value } = validation.schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `${validation.source}.${detail.path.join('.')}`,
          message: detail.message,
          value: detail.context?.value,
        })));
      } else {
        // Update the request with validated data
        if (validation.source === 'body') {
          req.body = value;
        } else if (validation.source === 'query') {
          req.query = value;
        } else {
          req.params = value;
        }
      }
    }

    if (errors.length > 0) {
      const validationError = new ValidationError('Validation failed', errors, req.requestId);
      return next(validationError);
    }

    next();
  };
};

/**
 * Custom validation helpers
 */
export const ValidationHelpers = {
  /**
   * Validate file upload
   */
  file: (options: {
    required?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}) => {
    return Joi.object({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().when('allowedTypes', {
        is: Joi.exist(),
        then: Joi.string().valid(...(options.allowedTypes || [])),
        otherwise: Joi.string(),
      }),
      size: Joi.number().when('maxSize', {
        is: Joi.exist(),
        then: Joi.number().max(options.maxSize || 10485760), // 10MB default
        otherwise: Joi.number(),
      }),
      buffer: Joi.binary().required(),
    }).when('required', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    });
  },

  /**
   * Validate array with unique values
   */
  uniqueArray: (itemSchema: Joi.Schema, key?: string) => {
    return Joi.array().items(itemSchema).unique(key);
  },

  /**
   * Validate conditional field
   */
  conditionalField: (condition: string, value: any, schema: Joi.Schema) => {
    return schema.when(condition, {
      is: value,
      then: Joi.required(),
      otherwise: Joi.optional(),
    });
  },

  /**
   * Validate date range
   */
  dateRange: () => {
    return Joi.object({
      startDate: ValidationPatterns.dateString.required(),
      endDate: ValidationPatterns.dateString.required().min(Joi.ref('startDate')),
    });
  },

  /**
   * Validate coordinates
   */
  coordinates: () => {
    return Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    });
  },

  /**
   * Validate color hex code
   */
  hexColor: () => {
    return Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
  },

  /**
   * Validate JSON string
   */
  jsonString: () => {
    return Joi.string().custom((value, helpers) => {
      try {
        JSON.parse(value);
        return value;
      } catch (error) {
        return helpers.error('any.invalid');
      }
    });
  },
};

/**
 * Sanitization helpers
 */
export const SanitizationHelpers = {
  /**
   * Sanitize HTML content
   */
  html: (value: string): string => {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  },

  /**
   * Sanitize SQL content
   */
  sql: (value: string): string => {
    return value
      .replace(/(['";])/g, '\\$1')
      .replace(/(--|\*\/|\/\*)/g, '');
  },

  /**
   * Normalize phone number
   */
  phone: (value: string): string => {
    return value.replace(/\D/g, '').replace(/^0+/, '');
  },

  /**
   * Normalize email
   */
  email: (value: string): string => {
    return value.toLowerCase().trim();
  },

  /**
   * Normalize name
   */
  name: (value: string): string => {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  },
};
