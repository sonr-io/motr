/**
 * Rate Limiting Middleware
 * Protects auth endpoints from abuse using KV storage
 */

import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Key prefix for KV storage
   */
  keyPrefix: string;
}

/**
 * Default rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  OTP_GENERATE: {
    maxRequests: 3,
    windowSeconds: 60, // 3 requests per minute
    keyPrefix: 'ratelimit:otp:generate',
  },
  OTP_VERIFY: {
    maxRequests: 5,
    windowSeconds: 60, // 5 requests per minute
    keyPrefix: 'ratelimit:otp:verify',
  },
  SESSION_AUTH: {
    maxRequests: 10,
    windowSeconds: 60, // 10 requests per minute
    keyPrefix: 'ratelimit:session:auth',
  },
} as const;

/**
 * Rate limit middleware factory
 * Uses KV to track request counts per IP address
 */
export function rateLimit(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    // Get client IP address (Cloudflare provides this)
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';

    // Create unique key for this IP and endpoint
    const rateLimitKey = `${config.keyPrefix}:${clientIP}`;

    try {
      // Get current count from KV
      const currentCount = await c.env.SESSIONS.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if limit exceeded
      if (count >= config.maxRequests) {
        return c.json(
          {
            error: 'Rate Limit Exceeded',
            message: `Too many requests. Please try again in ${config.windowSeconds} seconds.`,
            retryAfter: config.windowSeconds,
          },
          429
        );
      }

      // Increment counter
      const newCount = count + 1;
      await c.env.SESSIONS.put(rateLimitKey, newCount.toString(), {
        expirationTtl: config.windowSeconds,
      });

      // Add rate limit headers
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', (config.maxRequests - newCount).toString());
      c.header('X-RateLimit-Reset', new Date(Date.now() + config.windowSeconds * 1000).toISOString());

      await next();
    } catch (error) {
      console.error('[Rate Limit Error]', error);
      // In case of rate limit check failure, allow request but log error
      await next();
    }
  };
}

/**
 * Rate limit by email address (for OTP endpoints)
 */
export function rateLimitByEmail(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    try {
      const body = await c.req.json<{ email?: string }>();

      if (!body.email) {
        // No email provided, skip rate limit (will be caught by validation)
        await next();
        return;
      }

      const email = body.email.toLowerCase();
      const rateLimitKey = `${config.keyPrefix}:${email}`;

      // Get current count from KV
      const currentCount = await c.env.SESSIONS.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if limit exceeded
      if (count >= config.maxRequests) {
        return c.json(
          {
            error: 'Rate Limit Exceeded',
            message: `Too many requests for this email. Please try again in ${config.windowSeconds} seconds.`,
            retryAfter: config.windowSeconds,
          },
          429
        );
      }

      // Increment counter
      const newCount = count + 1;
      await c.env.SESSIONS.put(rateLimitKey, newCount.toString(), {
        expirationTtl: config.windowSeconds,
      });

      // Add rate limit headers
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', (config.maxRequests - newCount).toString());
      c.header('X-RateLimit-Reset', new Date(Date.now() + config.windowSeconds * 1000).toISOString());

      await next();
    } catch (error) {
      console.error('[Rate Limit Error]', error);
      // In case of error, allow request
      await next();
    }
  };
}
