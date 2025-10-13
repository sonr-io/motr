import { useQuery } from '@tanstack/react-query'
import { getTx } from '@sonr.io/sdk/client'
import { rpcEndpoint } from '../lib/client'

export interface UseTxQueryOptions {
  hash: string
  endpoint?: string
  enabled?: boolean
}

/**
 * Hook to query transaction details by hash
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTxQuery({
 *   hash: 'ABC123...',
 * })
 * ```
 */
export function useTxQuery({ hash, endpoint = rpcEndpoint, enabled = true }: UseTxQueryOptions) {
  return useQuery({
    queryKey: ['tx', hash],
    queryFn: () => getTx(endpoint, { hash }),
    enabled: enabled && !!hash,
    staleTime: Number.POSITIVE_INFINITY, // Transactions are immutable
    retry: 3,
  })
}
