/**
 * Request Validation Middleware
 * Zod schemas for validating API requests
 */

import { z } from 'zod';
import type { Context, Next } from 'hono';
import type { Bindings, Variables } from '../types';

// ==========================================
// Validation Schemas
// ==========================================

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email format').toLowerCase();

/**
 * OTP Generation Request Schema
 */
export const otpGenerateSchema = z.object({
  email: emailSchema,
  purpose: z.enum(['email_verification', 'login', 'password_reset']).optional(),
});

/**
 * OTP Verification Request Schema
 */
export const otpVerifySchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'OTP code must be 6 digits').regex(/^\d+$/, 'OTP code must be numeric'),
});

/**
 * Session Authentication Request Schema
 */
export const sessionAuthSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  username: z.string().min(1, 'username is required'),
});

/**
 * Chain Info Schema
 */
export const chainInfoSchema = z.object({
  chainId: z.string().min(1, 'chainId is required'),
  chainName: z.string().min(1, 'chainName is required'),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number().int().positive(),
  }),
  rpcUrls: z.array(z.string().url()).min(1, 'At least one RPC URL is required'),
  blockExplorerUrls: z.array(z.string().url()).optional(),
  iconUrl: z.string().url().optional(),
  network: z.string().optional(),
});

/**
 * Asset Info Schema
 */
export const assetInfoSchema = z.object({
  assetId: z.string().min(1, 'assetId is required'),
  chainId: z.string().min(1, 'chainId is required'),
  address: z.string().optional(),
  symbol: z.string().min(1, 'symbol is required'),
  name: z.string().min(1, 'name is required'),
  decimals: z.number().int().nonnegative(),
  logoUri: z.string().url().optional(),
  coingeckoId: z.string().optional(),
});

// ==========================================
// Validation Middleware
// ==========================================

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T extends z.ZodType<unknown>>(schema: T) {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    try {
      const body = await c.req.json();
      const validated = schema.parse(body);

      // Store validated data in context for use in route handler
      c.set('validatedBody', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            details: error.issues.map((e: z.ZodIssue) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      // Other errors (e.g., malformed JSON)
      return c.json(
        {
          error: 'Invalid Request',
          message: 'Failed to parse request body',
        },
        400
      );
    }
  };
}

/**
 * Validate URL query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodType<unknown>>(schema: T) {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    try {
      const query = c.req.query();
      const validated = schema.parse(query);

      // Store validated data in context
      c.set('validatedQuery', validated);

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: 'Validation Error',
            message: 'Query parameter validation failed',
            details: error.issues.map((e: z.ZodIssue) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      return c.json(
        {
          error: 'Invalid Request',
          message: 'Invalid query parameters',
        },
        400
      );
    }
  };
}
