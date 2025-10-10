import { RpcClient } from '@sonr.io/es/client'

/**
 * Initialize the RPC client for Sonr blockchain
 * Configure with testnet or mainnet RPC endpoint
 */
export const rpcClient = new RpcClient({
  url: import.meta.env.VITE_RPC_URL || 'https://rpc.testnet.sonr.io',
})

/**
 * Get the current RPC endpoint URL
 */
export function getRpcUrl(): string {
  return import.meta.env.VITE_RPC_URL || 'https://rpc.testnet.sonr.io'
}
