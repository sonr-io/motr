#!/usr/bin/env bun

/**
 * Simple script to populate Cloudflare KV namespaces with Chain Registry data
 *
 * Usage: bun run kv:populate [chain1] [chain2] ...
 */

import type { ChainRegistryChainInfo } from "@sonr.io/sdk/registry/types/ChainRegistryChainInfo";
import type { ChainRegistryAssetList } from "@sonr.io/sdk/registry/types/ChainRegistryAssetList";

// Read namespace IDs from wrangler.toml (script is in apps/frontend/scripts/)
const WRANGLER_TOML_PATH = import.meta.dir + "/../wrangler.toml";
const wranglerConfig = await Bun.file(WRANGLER_TOML_PATH).text();

// Parse namespace IDs from wrangler.toml
const chainRegistryMatch = wranglerConfig.match(/binding = "CHAIN_REGISTRY"[\s\S]*?id = "([^"]+)"/);
const assetRegistryMatch = wranglerConfig.match(/binding = "ASSET_REGISTRY"[\s\S]*?id = "([^"]+)"/);

if (!chainRegistryMatch?.[1] || !assetRegistryMatch?.[1]) {
  console.error("❌ Could not find CHAIN_REGISTRY or ASSET_REGISTRY namespace IDs in wrangler.toml");
  console.error("   Please run 'bun run kv:create' first and update the IDs in apps/frontend/wrangler.toml");
  process.exit(1);
}

const CHAIN_REGISTRY_ID = chainRegistryMatch[1];
const ASSET_REGISTRY_ID = assetRegistryMatch[1];

if (CHAIN_REGISTRY_ID.includes("placeholder") || ASSET_REGISTRY_ID.includes("placeholder")) {
  console.error("❌ Namespace IDs are still placeholders!");
  console.error("   Please run 'bun run kv:create' first and update the IDs in apps/frontend/wrangler.toml");
  process.exit(1);
}

// Default chains to populate
const DEFAULT_CHAINS = [
  "cosmoshub",
  "osmosis",
  "juno",
  "stargaze",
  "akash",
  "celestia",
  "dydx",
  "noble",
  "neutron",
  "injective",
  "kujira",
  "stride",
  "evmos",
  "axelar",
  "terra2",
];

/**
 * Fetch chain info from Cosmos Chain Registry
 */
async function fetchChainInfo(chain: string): Promise<ChainRegistryChainInfo | null> {
  try {
    const url = `https://raw.githubusercontent.com/cosmos/chain-registry/master/${chain}/chain.json`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️  Chain info not found for: ${chain}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching chain info for ${chain}:`, error);
    return null;
  }
}

/**
 * Fetch asset list from Cosmos Chain Registry
 */
async function fetchAssetList(chain: string): Promise<ChainRegistryAssetList | null> {
  try {
    const url = `https://raw.githubusercontent.com/cosmos/chain-registry/master/${chain}/assetlist.json`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️  Asset list not found for: ${chain}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching asset list for ${chain}:`, error);
    return null;
  }
}

/**
 * Get Cloudflare account ID from wrangler whoami
 */
async function getAccountId(): Promise<string> {
  const { $ } = await import("bun");
  const output = await $`npx wrangler whoami`.text();
  const match = output.match(/Account ID: ([a-f0-9]+)/);
  if (!match?.[1]) {
    throw new Error("Could not get account ID. Please run 'wrangler login' first.");
  }
  return match[1];
}

/**
 * Store key-value in KV namespace using Cloudflare API via wrangler
 */
async function putKV(namespaceId: string, key: string, value: unknown): Promise<boolean> {
  try {
    const { $ } = await import("bun");

    // Write to temp file since JSON can be large
    const tempFile = `/tmp/kv-${key}.json`;
    await Bun.write(tempFile, JSON.stringify(value));

    // Use wrangler kv key put with --remote flag to write to production KV
    await $`npx wrangler kv key put --namespace-id ${namespaceId} --remote ${key} --path ${tempFile}`.quiet();

    // Cleanup
    await $`rm ${tempFile}`.quiet();

    return true;
  } catch (error) {
    console.error(`Failed to store ${key}:`, error);
    return false;
  }
}

/**
 * Populate KV namespaces
 */
async function populate(chains: string[]) {
  console.log("🚀 Starting KV population (REMOTE mode - writing to production)...\n");
  console.log(`📍 Chain Registry ID: ${CHAIN_REGISTRY_ID}`);
  console.log(`📍 Asset Registry ID: ${ASSET_REGISTRY_ID}\n`);

  let chainSuccess = 0;
  let assetSuccess = 0;
  let failures = 0;

  for (const chain of chains) {
    console.log(`📦 Processing: ${chain}`);

    // Fetch and store chain info
    const chainInfo = await fetchChainInfo(chain);
    if (chainInfo) {
      const ok = await putKV(CHAIN_REGISTRY_ID, chain, chainInfo);
      if (ok) {
        console.log(`   ✅ Stored chain info`);
        chainSuccess++;
      } else {
        failures++;
      }
    } else {
      failures++;
    }

    // Fetch and store asset list
    const assetList = await fetchAssetList(chain);
    if (assetList) {
      const ok = await putKV(ASSET_REGISTRY_ID, chain, assetList);
      if (ok) {
        console.log(`   ✅ Stored asset list`);
        assetSuccess++;
      } else {
        failures++;
      }
    } else {
      failures++;
    }

    console.log("");
  }

  console.log("📊 Summary:");
  console.log(`   Chain info: ${chainSuccess}`);
  console.log(`   Asset lists: ${assetSuccess}`);
  console.log(`   Failures: ${failures}`);
  console.log("\n✨ Done!");
}

// Main
const customChains = process.argv.slice(2);
const chains = customChains.length > 0 ? customChains : DEFAULT_CHAINS;

console.log("🔧 Cloudflare KV Population");
console.log("=".repeat(50));
console.log(`\n📋 Processing ${chains.length} chains\n`);

populate(chains).catch(console.error);
