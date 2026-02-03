import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Performance optimization middleware
 * - Adds response compression hints
 * - Tracks slow queries
 * - Adds performance headers
 */
export const performanceOptimization = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Add response time tracking
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`, {
        method: req.method,
        path: req.path,
        duration,
        query: req.query,
        tenantId: (req as any).tenantId,
      });
    }
  });

  // Set cache headers for GET requests
  if (req.method === 'GET') {
    // API data endpoints should NOT be cached - they change frequently with user actions
    // (e.g., creating a product should immediately show in the list)
    if (
      req.path.includes('/products') ||
      req.path.includes('/locations') ||
      req.path.includes('/customers') ||
      req.path.includes('/suppliers') ||
      req.path.includes('/orders') ||
      req.path.includes('/inventory')
    ) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }

  next();
};

/**
 * Query optimization hints for Prisma
 */
export const queryOptimizationHints = {
  // Use select to fetch only needed fields
  selectFields: {
    user: {
      id: true,
      first_name: true,
      last_name: true,
      email: true,
      avatar_url: true,
    },
    company: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
    },
    location: {
      id: true,
      name: true,
      city: true,
      state: true,
      country: true,
    },
    product: {
      id: true,
      product_code: true,
      name: true,
      sku: true,
      selling_price: true,
      stock_quantity: true,
      image_url: true,
    },
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};
