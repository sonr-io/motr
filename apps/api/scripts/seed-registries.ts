/**
 * Seed Registry Script
 * Populates CHAIN_REGISTRY and ASSET_REGISTRY KV stores with common blockchain data
 *
 * Usage:
 *   bun run seed (from apps/api directory)
 *   bun run api:seed (from root directory)
 */

import type { ChainInfo, AssetInfo } from '../src/types';

// Common chains to seed for development
const SEED_CHAINS: ChainInfo[] = [
  {
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    nativeCurrency: {
      name: 'Atom',
      symbol: 'ATOM',
      decimals: 6,
    },
    rpcUrls: [
      'https://cosmos-rpc.polkachu.com',
      'https://rpc.cosmos.network',
    ],
    blockExplorerUrls: ['https://mintscan.io/cosmos'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    network: 'mainnet',
  },
  {
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    nativeCurrency: {
      name: 'Osmosis',
      symbol: 'OSMO',
      decimals: 6,
    },
    rpcUrls: [
      'https://osmosis-rpc.polkachu.com',
      'https://rpc.osmosis.zone',
    ],
    blockExplorerUrls: ['https://mintscan.io/osmosis'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
    network: 'mainnet',
  },
  {
    chainId: 'juno-1',
    chainName: 'Juno',
    nativeCurrency: {
      name: 'Juno',
      symbol: 'JUNO',
      decimals: 6,
    },
    rpcUrls: [
      'https://juno-rpc.polkachu.com',
      'https://rpc.juno.strange.love',
    ],
    blockExplorerUrls: ['https://mintscan.io/juno'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png',
    network: 'mainnet',
  },
  {
    chainId: 'stargaze-1',
    chainName: 'Stargaze',
    nativeCurrency: {
      name: 'Stargaze',
      symbol: 'STARS',
      decimals: 6,
    },
    rpcUrls: [
      'https://stargaze-rpc.polkachu.com',
      'https://rpc.stargaze-apis.com',
    ],
    blockExplorerUrls: ['https://mintscan.io/stargaze'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png',
    network: 'mainnet',
  },
  {
    chainId: 'akashnet-2',
    chainName: 'Akash',
    nativeCurrency: {
      name: 'Akash',
      symbol: 'AKT',
      decimals: 6,
    },
    rpcUrls: [
      'https://akash-rpc.polkachu.com',
      'https://rpc.akash.forbole.com',
    ],
    blockExplorerUrls: ['https://mintscan.io/akash'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png',
    network: 'mainnet',
  },
];

// Common assets to seed for development
const SEED_ASSETS: AssetInfo[] = [
  {
    assetId: 'atom',
    chainId: 'cosmoshub-4',
    symbol: 'ATOM',
    name: 'Cosmos Hub Atom',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
    coingeckoId: 'cosmos',
  },
  {
    assetId: 'osmo',
    chainId: 'osmosis-1',
    symbol: 'OSMO',
    name: 'Osmosis',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
    coingeckoId: 'osmosis',
  },
  {
    assetId: 'juno',
    chainId: 'juno-1',
    symbol: 'JUNO',
    name: 'Juno',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png',
    coingeckoId: 'juno-network',
  },
  {
    assetId: 'stars',
    chainId: 'stargaze-1',
    symbol: 'STARS',
    name: 'Stargaze',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png',
    coingeckoId: 'stargaze',
  },
  {
    assetId: 'akt',
    chainId: 'akashnet-2',
    symbol: 'AKT',
    name: 'Akash Network',
    decimals: 6,
    logoUri: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png',
    coingeckoId: 'akash-network',
  },
];

/**
 * Seed the registries via API endpoints
 */
async function seedRegistries() {
  const API_URL = process.env.API_URL || 'http://localhost:5165';

  console.log('🌱 Seeding Chain Registry...');

  // Seed chains
  for (const chain of SEED_CHAINS) {
    try {
      const response = await fetch(`${API_URL}/api/registry/chains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chain),
      });

      if (response.ok) {
        console.log(`  ✓ Added chain: ${chain.chainName} (${chain.chainId})`);
      } else {
        const error = await response.text();
        console.error(`  ✗ Failed to add chain ${chain.chainName}:`, error);
      }
    } catch (error) {
      console.error(`  ✗ Error adding chain ${chain.chainName}:`, error);
    }
  }

  console.log('\n🌱 Seeding Asset Registry...');

  // Seed assets
  for (const asset of SEED_ASSETS) {
    try {
      const response = await fetch(`${API_URL}/api/registry/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });

      if (response.ok) {
        console.log(`  ✓ Added asset: ${asset.name} (${asset.symbol})`);
      } else {
        const error = await response.text();
        console.error(`  ✗ Failed to add asset ${asset.name}:`, error);
      }
    } catch (error) {
      console.error(`  ✗ Error adding asset ${asset.name}:`, error);
    }
  }

  console.log('\n✨ Registry seeding complete!');
  console.log(`📊 Seeded ${SEED_CHAINS.length} chains and ${SEED_ASSETS.length} assets`);
}

// Run the seed function
seedRegistries().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
