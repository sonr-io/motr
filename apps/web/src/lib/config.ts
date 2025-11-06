/**
 * Application Configuration
 * Environment-specific configuration values
 */

import { PUBLIC_API_URL } from '$env/static/public';
import { dev } from '$app/environment';

/**
 * API Base URL
 * - Development: Uses PUBLIC_API_URL or defaults to localhost:5165
 * - Production: Uses PUBLIC_API_URL or same-origin /api
 */
export const API_BASE_URL = PUBLIC_API_URL || (dev ? 'http://localhost:5165/api' : '/api');

/**
 * Application environment
 */
export const IS_DEV = dev;

/**
 * Feature flags
 */
export const FEATURES = {
	webauthn: true,
	otp: true,
	registry: true,
} as const;
