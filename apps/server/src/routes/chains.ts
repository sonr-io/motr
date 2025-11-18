import { Elysia } from 'elysia';

// Chain data interfaces
interface ChainInfo {
  name: string;
  chainId: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  status: 'active' | 'inactive';
  lastBlock?: number;
  gasPrice?: string;
}

// Supported chains - in production this would come from KV store
const SUPPORTED_CHAINS = [
  {
    name: 'Ethereum',
    chainId: '1',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    status: 'active' as const,
  },
  {
    name: 'Polygon',
    chainId: '137',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    status: 'active' as const,
  },
  {
    name: 'Arbitrum',
    chainId: '42161',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    status: 'active' as const,
  },
  {
    name: 'Optimism',
    chainId: '10',
    rpcUrl: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    status: 'active' as const,
  },
  {
    name: 'Base',
    chainId: '8453',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    status: 'active' as const,
  },
  {
    name: 'Cosmos Hub',
    chainId: 'cosmoshub-4',
    rpcUrl: 'https://rpc.cosmos.network',
    blockExplorer: 'https://www.mintscan.io/cosmos',
    nativeCurrency: { name: 'Atom', symbol: 'ATOM', decimals: 6 },
    status: 'active' as const,
  },
  {
    name: 'Osmosis',
    chainId: 'osmosis-1',
    rpcUrl: 'https://rpc.osmosis.zone',
    blockExplorer: 'https://www.mintscan.io/osmosis',
    nativeCurrency: { name: 'Osmosis', symbol: 'OSMO', decimals: 6 },
    status: 'active' as const,
  },
  {
    name: 'Solana',
    chainId: 'mainnet-beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://solscan.io',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    status: 'active' as const,
  },
];

// Cache for chain status (in production, use KV store)
const chainStatusCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

async function getChainStatus(chainId: string): Promise<any> {
  const cached = chainStatusCache.get(chainId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const chain = SUPPORTED_CHAINS.find((c) => c.chainId === chainId);
    if (!chain) return null;

    // For now, return basic status. In production, you'd query actual RPC endpoints
    const status = {
      chainId,
      name: chain.name,
      status: chain.status,
      lastChecked: new Date().toISOString(),
      // Mock data - in production, query actual RPC
      blockHeight: Math.floor(Math.random() * 1000000) + 18000000,
      gasPrice: `${Math.floor(Math.random() * 50) + 10} gwei`,
      peers: Math.floor(Math.random() * 100) + 50,
    };

    chainStatusCache.set(chainId, { data: status, timestamp: Date.now() });
    return status;
  } catch (error) {
    console.error(`Error getting status for chain ${chainId}:`, error);
    return null;
  }
}

export const chainRoutes = new Elysia({ prefix: '/chain' })
  .get('/', () => {
    return {
      chains: SUPPORTED_CHAINS,
      total: SUPPORTED_CHAINS.length,
      timestamp: new Date().toISOString(),
    };
  })

  .get('/:chainId', async ({ params: { chainId } }) => {
    const chain = SUPPORTED_CHAINS.find((c) => c.chainId === chainId);

    if (!chain) {
      return new Response(
        JSON.stringify({
          error: 'Chain not found',
          chainId,
        }),
        { status: 404 }
      );
    }

    const status = await getChainStatus(chainId);

    return {
      ...chain,
      status: status || { lastChecked: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    };
  })

  .get('/:chainId/status', async ({ params: { chainId } }) => {
    const status = await getChainStatus(chainId);

    if (!status) {
      return new Response(
        JSON.stringify({
          error: 'Chain status unavailable',
          chainId,
        }),
        { status: 503 }
      );
    }

    return status;
  })

  .post('/:chainId/rpc', async ({ params: { chainId }, body }) => {
    // Chain RPC proxy endpoint
    // In production, this would validate requests, apply rate limiting,
    // and proxy to actual blockchain RPC endpoints

    const chain = SUPPORTED_CHAINS.find((c) => c.chainId === chainId);
    if (!chain) {
      return new Response(
        JSON.stringify({
          error: 'Chain not supported',
          chainId,
        }),
        { status: 404 }
      );
    }

    try {
      // Mock RPC response - in production, forward to actual RPC endpoint
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          blockNumber: '0x' + Math.floor(Math.random() * 1000000).toString(16),
          gasPrice: '0x' + (Math.floor(Math.random() * 50) + 10).toString(16),
          chainId: '0x' + parseInt(chainId).toString(16),
        },
      };

      return mockResponse;
    } catch (error) {
      console.error(`RPC error for chain ${chainId}:`, error);
      return new Response(
        JSON.stringify({
          error: 'RPC request failed',
          chainId,
        }),
        { status: 500 }
      );
    }
  });
