import { Elysia } from 'elysia';

// Price data interfaces
interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
    last_updated_at: number;
  };
}

// Asset registry - in production this would come from KV store
const SUPPORTED_ASSETS = [
  { symbol: 'BTC', coingeckoId: 'bitcoin', name: 'Bitcoin' },
  { symbol: 'ETH', coingeckoId: 'ethereum', name: 'Ethereum' },
  { symbol: 'SOL', coingeckoId: 'solana', name: 'Solana' },
  { symbol: 'ADA', coingeckoId: 'cardano', name: 'Cardano' },
  { symbol: 'DOT', coingeckoId: 'polkadot', name: 'Polkadot' },
  { symbol: 'LINK', coingeckoId: 'chainlink', name: 'Chainlink' },
  { symbol: 'UNI', coingeckoId: 'uniswap', name: 'Uniswap' },
  { symbol: 'AAVE', coingeckoId: 'aave', name: 'Aave' },
  { symbol: 'COMP', coingeckoId: 'compound-governance-token', name: 'Compound' },
  { symbol: 'MKR', coingeckoId: 'maker', name: 'Maker' },
  { symbol: 'YFI', coingeckoId: 'yearn-finance', name: 'Yearn Finance' },
  { symbol: 'SUSHI', coingeckoId: 'sushi', name: 'Sushi' },
  { symbol: 'CRV', coingeckoId: 'curve-dao-token', name: 'Curve DAO' },
  { symbol: 'BAL', coingeckoId: 'balancer', name: 'Balancer' },
  { symbol: 'REN', coingeckoId: 'ren', name: 'Ren' },
  { symbol: 'LRC', coingeckoId: 'loopring', name: 'Loopring' },
  { symbol: 'OMG', coingeckoId: 'omg', name: 'OMG Network' },
  { symbol: 'ZRX', coingeckoId: '0x', name: '0x' },
  { symbol: 'BAT', coingeckoId: 'basic-attention-token', name: 'Basic Attention Token' },
  { symbol: 'ANT', coingeckoId: 'aragon', name: 'Aragon' },
];

// Cache for price data (in production, use KV store)
const priceCache = new Map<string, { data: PriceData; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchPriceFromCoinGecko(symbol: string): Promise<PriceData | null> {
  try {
    const asset = SUPPORTED_ASSETS.find((a) => a.symbol === symbol);
    if (!asset) return null;

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${asset.coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Motr-Server/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoResponse = await response.json();
    const priceInfo = data[asset.coingeckoId];

    if (!priceInfo) return null;

    return {
      symbol,
      price: priceInfo.usd,
      change24h: priceInfo.usd_24h_change || 0,
      volume24h: priceInfo.usd_24h_vol || 0,
      marketCap: priceInfo.usd_market_cap || 0,
      lastUpdated: new Date(priceInfo.last_updated_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

async function getCachedPrice(symbol: string): Promise<PriceData | null> {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const freshData = await fetchPriceFromCoinGecko(symbol);
  if (freshData) {
    priceCache.set(symbol, { data: freshData, timestamp: Date.now() });
  }

  return freshData;
}

export const priceRoutes = new Elysia({ prefix: '/prices' })
  .get('/', async () => {
    // Get all supported assets
    const prices = await Promise.all(
      SUPPORTED_ASSETS.map(async (asset) => {
        const priceData = await getCachedPrice(asset.symbol);
        return priceData ? { ...asset, ...priceData } : null;
      })
    );

    return {
      assets: prices.filter(Boolean),
      timestamp: new Date().toISOString(),
      source: 'CoinGecko API',
    };
  })

  .get('/:symbol', async ({ params: { symbol } }) => {
    const upperSymbol = symbol.toUpperCase();
    const priceData = await getCachedPrice(upperSymbol);

    if (!priceData) {
      return new Response(
        JSON.stringify({
          error: 'Asset not found or price unavailable',
          symbol: upperSymbol,
        }),
        { status: 404 }
      );
    }

    const asset = SUPPORTED_ASSETS.find((a) => a.symbol === upperSymbol);
    return {
      ...asset,
      ...priceData,
      timestamp: new Date().toISOString(),
      source: 'CoinGecko API',
    };
  })

  .get('/stream', async ({ request }) => {
    // WebSocket endpoint for real-time price updates
    if (request.headers.get('upgrade') === 'websocket') {
      // In a real implementation, this would establish a WebSocket connection
      // For now, return a placeholder response
      return new Response('WebSocket endpoint - implementation pending', { status: 501 });
    }

    return new Response('WebSocket upgrade required', { status: 426 });
  })

  .get('/supported', () => {
    return {
      assets: SUPPORTED_ASSETS,
      total: SUPPORTED_ASSETS.length,
      lastUpdated: new Date().toISOString(),
    };
  });
