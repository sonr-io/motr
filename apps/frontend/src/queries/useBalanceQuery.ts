import { useQuery } from '@tanstack/react-query'
import { RpcClient, getNativeBalances } from '@sonr.io/es/client'

export interface UseBalanceQueryOptions {
  address: string
  rpcClient: RpcClient
  enabled?: boolean
}

/**
 * Hook to query native token balances from the blockchain
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBalanceQuery({
 *   address: 'sonr1...',
 *   rpcClient,
 * })
 * ```
 */
export function useBalanceQuery({ address, rpcClient, enabled = true }: UseBalanceQueryOptions) {
  return useQuery({
    queryKey: ['balances', address],
    queryFn: () => getNativeBalances(rpcClient, { address }),
    enabled: enabled && !!address,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  })
}
