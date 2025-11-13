import { Request, Response, NextFunction } from 'express';

// Temporarily disable all rate limiting for development
export const generalRateLimit = (req: Request, res: Response, next: NextFunction) => next();
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => next();
export const registrationRateLimit = (req: Request, res: Response, next: NextFunction) => next();
export const passwordResetRateLimit = (req: Request, res: Response, next: NextFunction) => next();
export const userRateLimit = (req: Request, res: Response, next: NextFunction) => next();
export const tenantRateLimit = (req: Request, res: Response, next: NextFunction) => next();
export const sensitiveOperationRateLimit = (req: Request, res: Response, next: NextFunction) => next();

// export interface RateLimitOptions {
//   windowMs: number;
//   maxRequests: number;
//   keyGenerator?: (req: Request) => string;
//   skipSuccessfulRequests?: boolean;
//   skipFailedRequests?: boolean;
//   onLimitReached?: (req: Request, res: Response) => void;
// }

// export interface RateLimitInfo {
//   limit: number;
//   remaining: number;
//   resetTime: number;
//   retryAfter?: number;
// }

// /**
//  * Create a rate limiting middleware
//  */
// export default function createRateLimit(options: RateLimitOptions) {
//   const {
//     windowMs,
//     maxRequests,
//     keyGenerator = defaultKeyGenerator,
//     skipSuccessfulRequests = false,
//     skipFailedRequests = false,
//     onLimitReached,
//   } = options;

//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const key = keyGenerator(req);
//       const windowSeconds = Math.floor(windowMs / 1000);

//       // Get current count and rate limit info
//       const rateLimitInfo = await redisClient.rateLimit(key, maxRequests, windowSeconds);

//       // Set rate limit headers
//       res.set({
//         'X-RateLimit-Limit': maxRequests.toString(),
//         'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
//         'X-RateLimit-Reset': new Date(rateLimitInfo.resetTime).toISOString(),
//       });

//       // Check if limit exceeded
//       if (!rateLimitInfo.allowed) {
//         const retryAfter = Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000);
        
//         res.set({
//           'Retry-After': retryAfter.toString(),
//           'X-RateLimit-RetryAfter': retryAfter.toString(),
//         });

//         // Call custom handler if provided
//         if (onLimitReached) {
//           onLimitReached(req, res);
//         }

//         logger.warn(`Rate limit exceeded for key: ${key}`, {
//           ip: req.ip,
//           userAgent: req.get('User-Agent'),
//           path: req.path,
//           method: req.method,
//         });

//         res.status(429).json({
//           success: false,
//           message: 'Too many requests, please try again later',
//           code: 'RATE_LIMIT_EXCEEDED',
//           retryAfter,
//           limit: maxRequests,
//           remaining: 0,
//           resetTime: rateLimitInfo.resetTime,
//         });
//         return;
//       }

//       // Track response to potentially skip counting
//       const originalSend = res.send;
//       res.send = function(data) {
//         const statusCode = res.statusCode;
        
//         // Decrement counter if we should skip this request
//         const shouldSkip = 
//           (skipSuccessfulRequests && statusCode >= 200 && statusCode < 400) ||
//           (skipFailedRequests && statusCode >= 400);

//         if (shouldSkip) {
//           redisClient.decr(key).catch(error => {
//             logger.error('Error decrementing rate limit counter:', error);
//           });
//         }

//         return originalSend.call(this, data);
//       };

//       next();
//     } catch (error) {
//       logger.error('Rate limiting error:', error);
//       // On error, allow the request to proceed
//       next();
//     }
//   };
// }

// /**
//  * Default key generator using IP address
//  */
// function defaultKeyGenerator(req: Request): string {
//   return `rate_limit:${req.ip}`;
// }

// /**
//  * Key generator for authenticated users
//  */
// export default function userKeyGenerator(req: Request): string {
//   const userId = req.userId || req.ip;
//   return `rate_limit:user:${userId}`;
// }

// /**
//  * Key generator for authentication endpoints
//  */
// export default function authKeyGenerator(req: Request): string {
//   const identifier = req.body?.emailOrPhone || req.body?.email || req.ip;
//   return `rate_limit:auth:${identifier}`;
// }

// /**
//  * Key generator for tenant-specific operations
//  */
// export default function tenantKeyGenerator(req: Request): string {
//   const tenantId = req.tenantId || 'global';
//   const userId = req.userId || req.ip;
//   return `rate_limit:tenant:${tenantId}:${userId}`;
// }

// /**
//  * Predefined rate limiters for common use cases
//  */

// // General API rate limiter
// export const generalRateLimit = createRateLimit({
//   windowMs: config.rateLimit.windowMs, // 15 minutes
//   maxRequests: config.rateLimit.maxRequests, // 100 requests
//   keyGenerator: defaultKeyGenerator,
// });

// // Strict rate limiter for authentication endpoints
// export const authRateLimit = createRateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   maxRequests: 5, // 5 login attempts
//   keyGenerator: authKeyGenerator,
//   onLimitReached: (req, res) => {
//     logger.warn('Authentication rate limit exceeded', {
//       ip: req.ip,
//       identifier: req.body?.emailOrPhone || req.body?.email,
//       userAgent: req.get('User-Agent'),
//     });
//   },
// });

// // Strict rate limiter for password reset
// export const passwordResetRateLimit = createRateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   maxRequests: 3, // 3 password reset attempts
//   keyGenerator: authKeyGenerator,
// });

// // Rate limiter for user registration
// export const registrationRateLimit = createRateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   maxRequests: 1000, // Very high limit to effectively disable
//   keyGenerator: defaultKeyGenerator,
// });

// // Rate limiter for authenticated users
// export const userRateLimit = createRateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   maxRequests: 1000, // Higher limit for authenticated users
//   keyGenerator: userKeyGenerator,
// });

// // Rate limiter for tenant operations
// export const tenantRateLimit = createRateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   maxRequests: 500, // Per tenant per user
//   keyGenerator: tenantKeyGenerator,
// });

// // Very strict rate limiter for sensitive operations
// export const sensitiveOperationRateLimit = createRateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   maxRequests: 10, // Very limited
//   keyGenerator: userKeyGenerator,
// });

// /**
//  * Middleware to check if user is rate limited
//  */
// export async function checkRateLimit(
//   key: string,
//   limit: number,
//   windowSeconds: number
// ): Promise<RateLimitInfo> {
//   try {
//     const rateLimitInfo = await redisClient.rateLimit(key, limit, windowSeconds);
    
//     return {
//       limit,
//       remaining: rateLimitInfo.remaining,
//       resetTime: rateLimitInfo.resetTime,
//       retryAfter: rateLimitInfo.allowed ? undefined : Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000),
//     };
//   } catch (error) {
//     logger.error('Error checking rate limit:', error);
//     // Return permissive values on error
//     return {
//       limit,
//       remaining: limit,
//       resetTime: Date.now() + (windowSeconds * 1000),
//     };
//   }
// }

// /**
//  * Reset rate limit for a specific key
//  */
// export async function resetRateLimit(key: string): Promise<void> {
//   try {
//     await redisClient.del(key);
//     logger.info(`Rate limit reset for key: ${key}`);
//   } catch (error) {
//     logger.error('Error resetting rate limit:', error);
//     throw error;
//   }
// }

// /**
//  * Get current rate limit status for a key
//  */
// export async function getRateLimitStatus(key: string): Promise<{ count: number; ttl: number }> {
//   try {
//     const count = parseInt(await redisClient.get(key) || '0', 10);
//     const ttl = await redisClient.ttl(key);
    
//     return { count, ttl };
//   } catch (error) {
//     logger.error('Error getting rate limit status:', error);
//     return { count: 0, ttl: -1 };
//   }
// }

// /**
//  * Whitelist IP addresses (bypass rate limiting)
//  */
// const whitelistedIPs = new Set([
//   '127.0.0.1',
//   '::1',
//   // Add more IPs as needed
// ]);

// export default function isWhitelisted(ip: string): boolean {
//   return whitelistedIPs.has(ip);
// }

// /**
//  * Rate limiter that respects IP whitelist
//  */
// export default function createWhitelistAwareRateLimit(options: RateLimitOptions) {
//   const rateLimiter = createRateLimit(options);
  
//   return (req: Request, res: Response, next: NextFunction): void => {
//     if (isWhitelisted(req.ip)) {
//       next();
//       return;
//     }
    
//     rateLimiter(req, res, next);
//   };
// }

// /**
//  * Dynamic rate limiter based on user role
//  */
// export default function createRoleBasedRateLimit(baseLimits: Record<string, RateLimitOptions>) {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     const userRole = req.userRole || 'EMPLOYEE';
//     const limits = baseLimits[userRole] || baseLimits['EMPLOYEE'];
    
//     const rateLimiter = createRateLimit(limits);
//     rateLimiter(req, res, next);
//   };
// }

// /**
//  * Burst rate limiter (allows short bursts but limits sustained usage)
//  */
// export default function createBurstRateLimit(options: {
//   burstLimit: number;
//   burstWindowMs: number;
//   sustainedLimit: number;
//   sustainedWindowMs: number;
//   keyGenerator?: (req: Request) => string;
// }) {
//   const {
//     burstLimit,
//     burstWindowMs,
//     sustainedLimit,
//     sustainedWindowMs,
//     keyGenerator = defaultKeyGenerator,
//   } = options;

//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const baseKey = keyGenerator(req);
//       const burstKey = `${baseKey}:burst`;
//       const sustainedKey = `${baseKey}:sustained`;

//       // Check burst limit
//       const burstInfo = await redisClient.rateLimit(
//         burstKey,
//         burstLimit,
//         Math.floor(burstWindowMs / 1000)
//       );

//       // Check sustained limit
//       const sustainedInfo = await redisClient.rateLimit(
//         sustainedKey,
//         sustainedLimit,
//         Math.floor(sustainedWindowMs / 1000)
//       );

//       // Use the more restrictive limit
//       const isAllowed = burstInfo.allowed && sustainedInfo.allowed;
//       const remaining = Math.min(burstInfo.remaining, sustainedInfo.remaining);
//       const resetTime = Math.max(burstInfo.resetTime, sustainedInfo.resetTime);

//       res.set({
//         'X-RateLimit-Limit': `${burstLimit}/${sustainedLimit}`,
//         'X-RateLimit-Remaining': remaining.toString(),
//         'X-RateLimit-Reset': new Date(resetTime).toISOString(),
//       });

//       if (!isAllowed) {
//         const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
//         res.set({
//           'Retry-After': retryAfter.toString(),
//         });

//         res.status(429).json({
//           success: false,
//           message: 'Rate limit exceeded',
//           code: 'RATE_LIMIT_EXCEEDED',
//           retryAfter,
//         });
//         return;
//       }

//       next();
//     } catch (error) {
//       logger.error('Burst rate limiting error:', error);
//       next();
//     }
//   };
// }
