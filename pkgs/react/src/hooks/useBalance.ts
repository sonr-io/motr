/**
 * React Query hook for fetching account balance
 * @module hooks/useBalance
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { QueryOptions } from '../types.js';

/**
 * Coin balance representation
 */
export interface Coin {
  denom: string;
  amount: string;
}

/**
 * Balance data returned from blockchain
 */
export interface Balance {
  address: string;
  coins: Coin[];
}

/**
 * Options for useBalance hook
 */
export interface UseBalanceOptions extends QueryOptions {
  /** Blockchain address to query */
  address: string;
  /** RPC endpoint URL */
  rpcUrl?: string;
  /** Specific denom to query (optional, returns all if not specified) */
  denom?: string;
}

/**
 * Query key factory for balance queries
 */
export const balanceKeys = {
  all: ['balance'] as const,
  detail: (address: string, denom?: string) => {
    if (denom) {
      return ['balance', address, denom] as const;
    }
    return ['balance', address] as const;
  },
};

/**
 * Fetches balance data from blockchain
 */
async function fetchBalance(
  address: string,
  denom?: string,
  _rpcUrl?: string,
): Promise<Balance> {
  // Placeholder implementation - will be replaced with actual SDK call
  return {
    address,
    coins: denom
      ? [{ denom, amount: '0' }]
      : [{ denom: 'usnr', amount: '0' }],
  };
}

/**
 * React Query hook for fetching account balance from Sonr blockchain
 *
 * Supports automatic refetching and polling for real-time balance updates.
 *
 * @example
 * ```tsx
 * function BalanceDisplay({ address }: { address: string }) {
 *   const { data: balance, isLoading } = useBalance({
 *     address,
 *     refetchInterval: 5000, // Poll every 5 seconds
 *   });
 *
 *   if (isLoading) return <div>Loading balance...</div>;
 *
 *   return (
 *     <div>
 *       {balance.coins.map((coin) => (
 *         <p key={coin.denom}>
 *           {coin.amount} {coin.denom}
 *         </p>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBalance(
  options: UseBalanceOptions,
): UseQueryResult<Balance, Error> {
  const {
    address,
    denom,
    rpcUrl,
    enabled = true,
    refetchInterval,
    staleTime,
  } = options;

  return useQuery({
    queryKey: balanceKeys.detail(address, denom),
    queryFn: () => fetchBalance(address, denom, rpcUrl),
    enabled: enabled && Boolean(address),
    refetchInterval,
    staleTime: staleTime ?? 10000, // 10 seconds default for balance
  });
}
