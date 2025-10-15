/**
 * Root provider for Sonr React integration
 * @module context/SonrProvider
 */

import { type ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';

/**
 * Network configuration for Sonr blockchain provider
 */
export interface SonrNetworkConfig {
  /** Chain ID */
  chainId: string;
  /** RPC endpoint URL */
  rpcUrl: string;
  /** REST API endpoint URL */
  restUrl?: string;
  /** Network name (e.g., "mainnet", "testnet") */
  name: string;
}

/**
 * Predefined network configurations
 */
export const NETWORKS = {
  mainnet: {
    chainId: 'sonr-1',
    rpcUrl: 'https://rpc.sonr.io',
    restUrl: 'https://api.sonr.io',
    name: 'mainnet',
  },
  testnet: {
    chainId: 'sonrtest-1',
    rpcUrl: 'https://rpc.testnet.sonr.io',
    restUrl: 'https://api.testnet.sonr.io',
    name: 'testnet',
  },
  local: {
    chainId: 'localchain_9000-1',
    rpcUrl: 'http://localhost:26657',
    restUrl: 'http://localhost:1317',
    name: 'local',
  },
} as const;

/**
 * Options for SonrProvider
 */
export interface SonrProviderProps {
  /** Network configuration */
  network?: SonrNetworkConfig;
  /** Custom QueryClient instance */
  queryClient?: QueryClient;
  /** QueryClient configuration */
  queryClientConfig?: QueryClientConfig;
  /** Child components */
  children: ReactNode;
}

/**
 * Default QueryClient configuration optimized for blockchain queries
 */
const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 10000, // 10 seconds
      gcTime: 300000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
};

/**
 * Root provider component that wraps QueryClientProvider with sensible defaults
 * for blockchain queries and provides network configuration context.
 *
 * @example
 * ```tsx
 * import { SonrProvider, NETWORKS } from '@sonr.io/react';
 *
 * function App() {
 *   return (
 *     <SonrProvider network={NETWORKS.testnet}>
 *       <YourApp />
 *     </SonrProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom QueryClient configuration
 * import { SonrProvider } from '@sonr.io/react';
 *
 * function App() {
 *   return (
 *     <SonrProvider
 *       network={{
 *         chainId: 'custom-chain',
 *         rpcUrl: 'https://custom-rpc.example.com',
 *         name: 'custom',
 *       }}
 *       queryClientConfig={{
 *         defaultOptions: {
 *           queries: {
 *             staleTime: 20000,
 *           },
 *         },
 *       }}
 *     >
 *       <YourApp />
 *     </SonrProvider>
 *   );
 * }
 * ```
 */
export function SonrProvider({
  network = NETWORKS.testnet,
  queryClient,
  queryClientConfig,
  children,
}: SonrProviderProps) {
  // Create QueryClient if not provided
  const client =
    queryClient ??
    new QueryClient({
      ...defaultQueryClientConfig,
      ...queryClientConfig,
      defaultOptions: {
        ...defaultQueryClientConfig.defaultOptions,
        ...queryClientConfig?.defaultOptions,
        queries: {
          ...defaultQueryClientConfig.defaultOptions?.queries,
          ...queryClientConfig?.defaultOptions?.queries,
        },
        mutations: {
          ...defaultQueryClientConfig.defaultOptions?.mutations,
          ...queryClientConfig?.defaultOptions?.mutations,
        },
      },
    });

  // Store network config in client's default options for hooks to access
  // @ts-expect-error - Adding custom network property to QueryClient
  client.network = network;

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
