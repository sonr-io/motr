#!/usr/bin/env bun
/**
 * Smart Asset Bundling Script
 *
 * This script:
 * 1. Copies SvelteKit build output to public/
 * 2. Copies WASM files to dedicated locations
 * 3. Copies shared assets from @pkgs/config/public/
 */

import { $ } from "bun";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Change to monorepo root directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const monoRepoRoot = resolve(__dirname, "../../..");
process.chdir(monoRepoRoot);

// Helper to get file size in human-readable format
async function getDirectorySize(path) {
  if (!existsSync(path)) return "0B";
  const result = await $`du -sh ${path}`.text();
  return result.split("\t")[0];
}

console.log("🧹 Cleaning public directory...");
await $`rm -rf public`;
await $`mkdir -p public/wasm`;

console.log("📦 Copying SvelteKit build...");

// Copy SvelteKit Cloudflare build output
const svelteKitBuild = "apps/web/.svelte-kit/cloudflare";
if (existsSync(svelteKitBuild)) {
  console.log("  ✓ SvelteKit Cloudflare build");
  // Copy directory contents (not the directory itself)
  await $`sh -c 'cp -r ${svelteKitBuild}/* public/'`;
} else {
  console.log("  ⚠ SvelteKit build not found - run 'bun run build' first");
}

console.log("🔧 Copying WASM files...");
const wasmFiles = [
  { src: "libs/vault/dist/vault.wasm", dest: "public/wasm/vault.wasm", label: "vault.wasm" },
  { src: "libs/enclave/dist/enclave.wasm", dest: "public/wasm/enclave.wasm", label: "enclave.wasm" },
  { src: "libs/vault/dist/wasm_exec.js", dest: "public/wasm/wasm_exec.js", label: "wasm_exec.js" },
];

for (const { src, dest, label } of wasmFiles) {
  if (existsSync(src)) {
    await $`cp ${src} ${dest}`;
    console.log(`  ✓ ${label}`);
  } else {
    console.log(`  ⚠ ${label} not found - WASM build may be needed`);
  }
}

console.log("🎨 Copying shared assets (favicons, manifests)...");
const configPublic = "pkgs/config/public";
if (existsSync(configPublic)) {
  const assetExts = ["png", "ico", "svg", "txt", "webmanifest"];
  for (const ext of assetExts) {
    await $`cp ${configPublic}/*.${ext} public/ 2>/dev/null || true`.quiet();
  }
  console.log("  ✓ Favicons, PWA icons, robots.txt");
}

console.log("");
console.log("✨ Bundle complete!");
console.log("");
console.log("📊 Build Summary:");

// Print sizes for key directories
const totalSize = await getDirectorySize("public");
const wasmSize = await getDirectorySize("public/wasm");
console.log(`  SvelteKit:  ${totalSize}`);
console.log(`  WASM:       ${wasmSize}`);
console.log(`  Total:      ${totalSize}`);
