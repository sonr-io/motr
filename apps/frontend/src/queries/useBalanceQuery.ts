import { useQuery } from '@tanstack/react-query'
import { getNativeBalances } from '@sonr.io/es/client'
import { rpcEndpoint } from '@/lib/client'

export interface UseBalanceQueryOptions {
  address: string
  endpoint?: string
  enabled?: boolean
}

/**
 * Hook to query native token balances from the blockchain
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBalanceQuery({
 *   address: 'sonr1...',
 * })
 * ```
 */
export function useBalanceQuery({ address, endpoint = rpcEndpoint, enabled = true }: UseBalanceQueryOptions) {
  return useQuery({
    queryKey: ['balances', address],
    queryFn: () => getNativeBalances(endpoint, { address }),
    enabled: enabled && !!address,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  })
}
