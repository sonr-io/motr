import { useQuery } from '@tanstack/react-query'
import { RpcClient, getAccount } from '@sonr.io/es/client'

export interface UseAccountQueryOptions {
  address: string
  rpcClient: RpcClient
  enabled?: boolean
}

/**
 * Hook to query account information from the blockchain
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAccountQuery({
 *   address: 'sonr1...',
 *   rpcClient,
 * })
 * ```
 */
export function useAccountQuery({ address, rpcClient, enabled = true }: UseAccountQueryOptions) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: () => getAccount(rpcClient, { address }),
    enabled: enabled && !!address,
    staleTime: 30000, // 30 seconds
  })
}
