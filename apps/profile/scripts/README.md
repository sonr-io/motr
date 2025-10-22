# Cloudflare KV Scripts

Scripts for managing Cloudflare KV namespaces for Chain Registry data.

## Overview

These scripts help you populate Cloudflare KV namespaces with chain and asset registry data from the Cosmos Chain Registry. The data is stored in the `apps/frontend` worker for fast, edge-cached access to blockchain metadata.

## Prerequisites

1. **Wrangler CLI** - Installed automatically via `npx` or install globally:
   ```bash
   npm install -g wrangler
   ```

2. **Authentication** - Login to Cloudflare:
   ```bash
   wrangler login
   ```
   Or set `CLOUDFLARE_API_TOKEN` environment variable.

## Setup

### 1. Create KV Namespaces

```bash
# From project root
bun run kv:create

# Or from pkgs/cloudflare
bun run kv:create
```

This will:
- Create `CHAIN_REGISTRY` and `ASSET_REGISTRY` KV namespaces
- Output the configuration for `apps/frontend/wrangler.toml`

### 2. Update wrangler.toml

Copy the generated configuration into `apps/frontend/wrangler.toml`, replacing the placeholder IDs:

```toml
# KV namespace for Chain Registry
[[kv_namespaces]]
binding = "CHAIN_REGISTRY"
id = "your-actual-chain-registry-id"
preview_id = "your-actual-chain-registry-id"

# KV namespace for Asset Registry
[[kv_namespaces]]
binding = "ASSET_REGISTRY"
id = "your-actual-asset-registry-id"
preview_id = "your-actual-asset-registry-id"
```

### 3. Populate KV Namespaces

```bash
# Populate with default chains (cosmoshub, osmosis, juno, etc.)
bun run kv:populate

# Or populate specific chains
bun run kv:populate cosmoshub osmosis celestia
```

## Scripts

### create-kv.ts

Creates KV namespaces using the Wrangler CLI.

**Usage:**
```bash
bun run kv:create
```

**What it does:**
- Uses `wrangler kv:namespace create` to create namespaces
- Parses the output to extract namespace IDs
- Displays configuration to add to wrangler.toml

### populate-kv.ts

Fetches chain and asset data from Cosmos Chain Registry and stores it in KV namespaces.

**Usage:**
```bash
# Default chains
bun run kv:populate

# Custom chains
bun run kv:populate cosmoshub osmosis celestia
```

**What it does:**
- Fetches data from `https://github.com/cosmos/chain-registry`
- Uses `wrangler kv:key put` to store data with the `--binding` flag
- Targets the `apps/frontend/wrangler.toml` configuration

**Default Chains:**
- cosmoshub
- osmosis
- juno
- stargaze
- akash
- celestia
- dydx
- noble
- neutron
- injective
- kujira
- stride
- evmos
- axelar
- terra2

## Usage in Worker

Once populated, access the data in `apps/frontend/src/worker.ts`:

```typescript
import type { ChainRegistryChainInfo } from "@sonr.io/sdk/registry/types/ChainRegistryChainInfo";
import type { ChainRegistryAssetList } from "@sonr.io/sdk/registry/types/ChainRegistryAssetList";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Get chain info
    if (url.pathname === "/api/chain/info/cosmoshub") {
      const chainInfo = await env.CHAIN_REGISTRY.get<ChainRegistryChainInfo>(
        "cosmoshub",
        "json"
      );
      return Response.json(chainInfo);
    }

    // Get asset list
    if (url.pathname === "/api/chain/assets/cosmoshub") {
      const assetList = await env.ASSET_REGISTRY.get<ChainRegistryAssetList>(
        "cosmoshub",
        "json"
      );
      return Response.json(assetList);
    }

    // ... rest of your worker logic
  },
};
```

## Data Structure

### CHAIN_REGISTRY

- **Key:** Chain identifier (e.g., "cosmoshub", "osmosis")
- **Value:** `ChainRegistryChainInfo` object containing:
  - Chain metadata (name, type, ID)
  - Network configuration (RPC, REST, gRPC endpoints)
  - Fee tokens and gas prices
  - Staking information
  - Codebase details
  - Explorer links

### ASSET_REGISTRY

- **Key:** Chain identifier (e.g., "cosmoshub", "osmosis")
- **Value:** `ChainRegistryAssetList` object containing:
  - Array of assets for the chain
  - Asset metadata (name, symbol, display)
  - Denomination units and exponents
  - IBC trace information
  - Logo URIs and images
  - Coingecko IDs

## Architecture Notes

### Why Not a Root wrangler.toml?

This monorepo uses **separate wrangler.toml files** for each deployable worker:

- ✅ `apps/frontend/wrangler.toml` - Deployable frontend worker
- ❌ `pkgs/cloudflare/wrangler.toml` - Removed (packages don't deploy)

**Rationale:**
1. Each wrangler.toml represents one deployable Worker
2. Cloudflare doesn't support "inheriting" or "extending" wrangler configs
3. Packages (`pkgs/*`) only export TypeScript code, not deployable workers
4. The `apps/frontend` worker imports and deploys Durable Objects/Workflows from `@pkgs/cloudflare`

### Package vs Worker

```
pkgs/cloudflare/          ← Package (exports code)
├── src/
│   ├── durable/          ← Durable Object classes
│   ├── workflows/        ← Workflow classes
│   └── index.ts          ← Package exports
└── scripts/              ← Helper scripts

apps/frontend/            ← Deployable Worker
├── src/
│   └── worker.ts         ← Imports from @pkgs/cloudflare
└── wrangler.toml         ← Worker configuration
```

## Troubleshooting

### Authentication Errors

Make sure you're logged in:
```bash
wrangler login
```

Or set your API token:
```bash
export CLOUDFLARE_API_TOKEN="your-token"
```

### Namespace Not Found

Ensure you've:
1. Created the namespaces with `bun run kv:create`
2. Updated `apps/frontend/wrangler.toml` with the correct IDs
3. The bindings match exactly: `CHAIN_REGISTRY` and `ASSET_REGISTRY`

### Rate Limiting

The scripts fetch data from GitHub's raw content API. If populating many chains:
- GitHub may rate limit anonymous requests
- Consider authenticating with GitHub or adding delays

## Maintenance

To update registry data, simply re-run the populate script:

```bash
bun run kv:populate
```

This will overwrite existing entries with the latest data from the Cosmos Chain Registry.
