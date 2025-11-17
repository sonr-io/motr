/**
 * Type definitions for Sonr API
 */

export type Bindings = {
  ENCLAVE: Fetcher;
  SESSIONS: KVNamespace;
  OTP_STORE: KVNamespace;
  CHAIN_REGISTRY: KVNamespace;
  ASSET_REGISTRY: KVNamespace;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  EMAIL_FROM?: string;
};

/**
 * Context variables set by middleware
 */
export type Variables = {
  validatedBody?: unknown;
  validatedQuery?: unknown;
};

export interface SessionData {
  userId?: string;
  username?: string;
  authenticated: boolean;
  createdAt: number;
  lastActivityAt: number;
}

export interface ChainInfo {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrl?: string;
  network?: string;
}

export interface AssetInfo {
  assetId: string;
  chainId: string;
  address?: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  coingeckoId?: string;
}

export interface OTPData {
  code: string;
  email: string;
  purpose: 'email_verification' | 'login' | 'password_reset';
  createdAt: number;
  expiresAt: number;
  attempts: number;
}
