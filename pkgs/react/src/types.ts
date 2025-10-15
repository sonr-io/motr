/**
 * Common types for @sonr.io/react package
 */

/**
 * Network configuration for Sonr blockchain
 */
export interface NetworkConfig {
  /** RPC endpoint URL */
  rpcUrl: string;
  /** REST endpoint URL */
  restUrl?: string;
  /** Chain ID */
  chainId: string;
  /** Network name (mainnet, testnet, devnet) */
  network: 'mainnet' | 'testnet' | 'devnet' | 'localnet';
}

/**
 * Wallet connection state
 */
export interface WalletState {
  /** Connected wallet address */
  address: string | null;
  /** Wallet connection status */
  isConnected: boolean;
  /** Wallet type (keplr, walletconnect, etc.) */
  walletType: string | null;
}

/**
 * Query options for hooks
 */
export interface QueryOptions {
  /** Enable automatic refetching */
  enabled?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
  /** Stale time in milliseconds */
  staleTime?: number;
}
