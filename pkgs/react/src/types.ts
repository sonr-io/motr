/**
 * Common types for @sonr.io/react package
 */

/**
 * Query options for hooks
 */
export interface QueryOptions {
  /** Enable automatic refetching */
  enabled?: boolean;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
  /** Stale time in milliseconds */
  staleTime?: number;
}
