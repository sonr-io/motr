/**
 * React Query hook for fetching blockchain account data
 * @module hooks/useAccount
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { QueryOptions } from '../types.js';

/**
 * Account data returned from blockchain
 */
export interface Account {
  address: string;
  accountNumber?: string;
  sequence?: string;
  pubKey?: string;
}

/**
 * Options for useAccount hook
 */
export interface UseAccountOptions extends QueryOptions {
  /** Blockchain address to query */
  address: string;
  /** RPC endpoint URL */
  rpcUrl?: string;
}

/**
 * Query key factory for account queries
 */
export const accountKeys = {
  all: ['account'] as const,
  detail: (address: string) => ['account', address] as const,
};

/**
 * Fetches account data from blockchain
 */
async function fetchAccount(address: string, _rpcUrl?: string): Promise<Account> {
  // Placeholder implementation - will be replaced with actual SDK call
  return {
    address,
    accountNumber: '0',
    sequence: '0',
  };
}

/**
 * React Query hook for fetching account data from Sonr blockchain
 *
 * @example
 * ```tsx
 * function AccountDisplay({ address }: { address: string }) {
 *   const { data: account, isLoading, error } = useAccount({ address });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <p>Address: {account.address}</p>
 *       <p>Account Number: {account.accountNumber}</p>
 *       <p>Sequence: {account.sequence}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAccount(
  options: UseAccountOptions,
): UseQueryResult<Account, Error> {
  const { address, rpcUrl, enabled = true, refetchInterval, staleTime } = options;

  return useQuery({
    queryKey: accountKeys.detail(address),
    queryFn: () => fetchAccount(address, rpcUrl),
    enabled: enabled && Boolean(address),
    refetchInterval,
    staleTime: staleTime ?? 30000, // 30 seconds default
  });
}
