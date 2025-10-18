import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnclaveProvider } from '@sonr.io/react';
import type { ReactNode } from 'react';

/**
 * Combined providers for the application
 *
 * This component wraps the entire app with:
 * - TanStack Query for data fetching and caching
 * - Enclave Provider for cryptographic vault operations
 */
export function AppProviders({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <EnclaveProvider
        config={{
          wasmPath: '/enclave.wasm',
        }}
      >
        {children}
      </EnclaveProvider>
    </QueryClientProvider>
  );
}

/**
 * Get context for providers
 */
export function getProvidersContext() {
  const queryClient = new QueryClient();
  return {
    queryClient,
  };
}
