import { useQuery } from '@tanstack/react-query'
import { getAccount } from '@sonr.io/sdk/client'
import { rpcEndpoint } from '@/lib/client'

export interface UseAccountQueryOptions {
  address: string
  endpoint?: string
  enabled?: boolean
}

/**
 * Hook to query account information from the blockchain
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAccountQuery({
 *   address: 'sonr1...',
 * })
 * ```
 */
export function useAccountQuery({ address, endpoint = rpcEndpoint, enabled = true }: UseAccountQueryOptions) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: () => getAccount(endpoint, { address }),
    enabled: enabled && !!address,
    staleTime: 30000, // 30 seconds
  })
}
