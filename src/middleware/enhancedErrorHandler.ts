import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/config';

// Error types enum
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  MAINTENANCE_ERROR = 'MAINTENANCE_ERROR',
}

// HTTP status codes mapping
export const ErrorStatusCodes: Record<ErrorType, number> = {
  [ErrorType.VALIDATION_ERROR]: 400,
  [ErrorType.BAD_REQUEST_ERROR]: 400,
  [ErrorType.AUTHENTICATION_ERROR]: 401,
  [ErrorType.AUTHORIZATION_ERROR]: 403,
  [ErrorType.NOT_FOUND_ERROR]: 404,
  [ErrorType.CONFLICT_ERROR]: 409,
  [ErrorType.TIMEOUT_ERROR]: 408,
  [ErrorType.RATE_LIMIT_ERROR]: 429,
  [ErrorType.INTERNAL_SERVER_ERROR]: 500,
  [ErrorType.DATABASE_ERROR]: 500,
  [ErrorType.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorType.MAINTENANCE_ERROR]: 503,
};

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly requestId?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL_SERVER_ERROR,
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.type = type;
    this.statusCode = ErrorStatusCodes[type];
    this.isOperational = true;
    this.details = details;
    this.requestId = requestId;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error class
export class ValidationError extends AppError {
  constructor(message: string, details?: any, requestId?: string) {
    super(message, ErrorType.VALIDATION_ERROR, details, requestId);
  }
}

// Authentication error class
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', requestId?: string) {
    super(message, ErrorType.AUTHENTICATION_ERROR, undefined, requestId);
  }
}

// Authorization error class
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', requestId?: string) {
    super(message, ErrorType.AUTHORIZATION_ERROR, undefined, requestId);
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', requestId?: string) {
    super(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, undefined, requestId);
  }
}

// Conflict error class
export class ConflictError extends AppError {
  constructor(message: string, requestId?: string) {
    super(message, ErrorType.CONFLICT_ERROR, undefined, requestId);
  }
}

// Database error class
export class DatabaseError extends AppError {
  constructor(message: string, details?: any, requestId?: string) {
    super(message, ErrorType.DATABASE_ERROR, details, requestId);
  }
}

// Rate limit error class
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', requestId?: string) {
    super(message, ErrorType.RATE_LIMIT_ERROR, undefined, requestId);
  }
}

/**
 * Enhanced error handler middleware
 */
export const enhancedErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.requestId || 'unknown';
  let error: AppError;

  // Convert unknown errors to AppError
  if (err instanceof AppError) {
    error = err;
  } else {
    error = convertToAppError(err, requestId);
  }

  // Log error
  logError(error, req);

  // Send error response
  sendErrorResponse(error, res, requestId);
};

/**
 * Convert unknown errors to AppError
 */
function convertToAppError(err: Error, requestId: string): AppError {
  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return handlePrismaError(err, requestId);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return new AuthenticationError('Invalid or expired token', requestId);
  }

  // Validation errors (Joi)
  if (err.name === 'ValidationError') {
    return new ValidationError(err.message, (err as any).details, requestId);
  }

  // Syntax errors
  if (err instanceof SyntaxError && 'body' in err) {
    return new ValidationError('Invalid JSON in request body', undefined, requestId);
  }

  // Default to internal server error
  return new AppError(
    config.env === 'production' ? 'Internal server error' : err.message,
    ErrorType.INTERNAL_SERVER_ERROR,
    config.env === 'development' ? { stack: err.stack } : undefined,
    requestId
  );
}

/**
 * Handle Prisma database errors
 */
function handlePrismaError(err: any, requestId: string): AppError {
  const code = err.code;

  switch (code) {
    case 'P2002':
      return new ConflictError('Resource already exists', requestId);
    case 'P2025':
      return new NotFoundError('Record', requestId);
    case 'P2003':
      return new ValidationError('Foreign key constraint failed', undefined, requestId);
    case 'P2014':
      return new ValidationError('Invalid relation', undefined, requestId);
    default:
      return new DatabaseError('Database operation failed', { code }, requestId);
  }
}

/**
 * Log error with appropriate level
 */
function logError(error: AppError, req: Request): void {
  const logData = {
    requestId: error.requestId,
    type: error.type,
    statusCode: error.statusCode,
    message: error.message,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.userId,
    tenantId: req.tenantId,
    details: error.details,
    stack: config.env === 'development' ? error.stack : undefined,
  };

  // Log based on error severity
  if (error.statusCode >= 500) {
    logger.error('Server error', logData);
  } else if (error.statusCode >= 400) {
    logger.warn('Client error', logData);
  } else {
    logger.info('Request error', logData);
  }
}

/**
 * Send error response
 */
function sendErrorResponse(error: AppError, res: Response, requestId: string): void {
  const response: any = {
    success: false,
    error: {
      type: error.type,
      message: error.message,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  // Add details in development mode or for validation errors
  if (config.env === 'development' || error.type === ErrorType.VALIDATION_ERROR) {
    if (error.details) {
      response.error.details = error.details;
    }
    if (config.env === 'development' && error.stack) {
      response.error.stack = error.stack;
    }
  }

  // Add retry information for rate limiting
  if (error.type === ErrorType.RATE_LIMIT_ERROR) {
    response.error.retryAfter = 60; // seconds
  }

  // Add maintenance information
  if (error.type === ErrorType.MAINTENANCE_ERROR) {
    response.error.retryAfter = 3600; // 1 hour
  }

  res.status(error.statusCode).json(response);
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`, req.requestId);
  next(error);
};

/**
 * Unhandled rejection handler
 */
export const setupUnhandledRejectionHandler = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });

    // Gracefully close the server
    process.exit(1);
  });
};

/**
 * Uncaught exception handler
 */
export const setupUncaughtExceptionHandler = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
    });

    // Gracefully close the server
    process.exit(1);
  });
};

/**
 * Error boundary for specific routes
 */
export const errorBoundary = (routeName: string) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error in ${routeName}`, {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack,
      route: routeName,
    });

    next(err);
  };
};

/**
 * Validation error formatter for Joi
 */
export const formatJoiError = (error: any): ValidationError => {
  const details = error.details?.map((detail: any) => ({
    field: detail.path.join('.'),
    message: detail.message,
    value: detail.context?.value,
  }));

  return new ValidationError('Validation failed', details);
};

/**
 * Database connection error handler
 */
export const handleDatabaseConnection = async (operation: () => Promise<any>): Promise<any> => {
  try {
    return await operation();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new DatabaseError('Database connection failed');
    }
    throw error;
  }
};

/**
 * Redis connection error handler
 */
export const handleRedisConnection = async (operation: () => Promise<any>): Promise<any> => {
  try {
    return await operation();
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      logger.warn('Redis connection failed, continuing without cache');
      return null;
    }
    throw error;
  }
};
