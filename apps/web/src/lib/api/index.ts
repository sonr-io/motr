/**
 * API Client Library
 * Exports all API modules for convenient importing
 */

// Re-export all modules
export * as session from './session';
export * as identity from './identity';
export * as registry from './registry';
export * as otp from './otp';

// Re-export client utilities
export { ApiClientError, type ApiResponse, type ApiError } from './client';
