/**
 * Get the current RPC endpoint URL
 * Configure with testnet or mainnet RPC endpoint
 */
export function getRpcUrl(): string {
  return import.meta.env.VITE_RPC_URL || "https://rpc.testnet.sonr.io";
}

/**
 * The default RPC endpoint URL for the application
 */
export const rpcEndpoint = getRpcUrl();
