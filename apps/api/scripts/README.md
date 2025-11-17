# API Scripts

This directory contains utility scripts for the Sonr API.

## seed-registries.ts

Seeds the CHAIN_REGISTRY and ASSET_REGISTRY KV stores with common blockchain data for development.

### Seeded Data

The script populates the registries with:

**Chains:**
- Cosmos Hub (`cosmoshub-4`)
- Osmosis (`osmosis-1`)
- Juno (`juno-1`)
- Stargaze (`stargaze-1`)
- Akash (`akashnet-2`)

**Assets:**
- ATOM (Cosmos Hub)
- OSMO (Osmosis)
- JUNO (Juno)
- STARS (Stargaze)
- AKT (Akash)

### Usage

**From apps/api directory:**
```bash
bun run seed
```

**From monorepo root:**
```bash
bun run api:seed
```

**With dev server (automatic):**
```bash
cd apps/api
bun run dev:seed  # Starts dev server and seeds after 3 seconds
```

### How It Works

1. Waits for the API server to be running (default: http://localhost:5165)
2. Makes POST requests to `/api/registry/chains` and `/api/registry/assets` endpoints
3. Populates the KV stores with seed data via the API
4. Reports success/failure for each chain and asset

### Custom API URL

Override the API URL with an environment variable:

```bash
API_URL=https://staging.sonr.id bun run seed
```

### Development Workflow

**First time setup:**
1. Start the API dev server: `bun run dev`
2. In another terminal, run: `bun run seed`
3. Verify: `curl http://localhost:5165/api/registry/chains`

**Subsequent starts:**
- The KV data persists across restarts in local development
- Re-run `bun run seed` if you want to reset/re-populate the data

### Adding More Chains/Assets

Edit the `SEED_CHAINS` and `SEED_ASSETS` arrays in `seed-registries.ts` to add more data.

Example:
```typescript
const SEED_CHAINS: ChainInfo[] = [
  // ... existing chains
  {
    chainId: 'secret-4',
    chainName: 'Secret Network',
    nativeCurrency: {
      name: 'Secret',
      symbol: 'SCRT',
      decimals: 6,
    },
    rpcUrls: ['https://rpc.secret.network'],
    blockExplorerUrls: ['https://mintscan.io/secret'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png',
    network: 'mainnet',
  },
];
```
