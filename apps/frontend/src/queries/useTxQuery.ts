import { useQuery } from '@tanstack/react-query'
import { RpcClient, getTx } from '@sonr.io/es/client'

export interface UseTxQueryOptions {
  hash: string
  rpcClient: RpcClient
  enabled?: boolean
}

/**
 * Hook to query transaction details by hash
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTxQuery({
 *   hash: 'ABC123...',
 *   rpcClient,
 * })
 * ```
 */
export function useTxQuery({ hash, rpcClient, enabled = true }: UseTxQueryOptions) {
  return useQuery({
    queryKey: ['tx', hash],
    queryFn: () => getTx(rpcClient, { hash }),
    enabled: enabled && !!hash,
    staleTime: Number.POSITIVE_INFINITY, // Transactions are immutable
    retry: 3,
  })
}
