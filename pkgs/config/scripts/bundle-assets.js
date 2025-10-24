#!/usr/bin/env bun
/**
 * Smart Asset Bundling Script
 *
 * This script:
 * 1. Copies all app builds to public/{app}/ directories
 * 2. Extracts shared vendor chunks to public/shared/
 * 3. Copies WASM files to dedicated locations
 * 4. Copies shared assets from @pkgs/config/public/
 */

import { $ } from "bun";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

// Helper to get file size in human-readable format
async function getDirectorySize(path) {
  if (!existsSync(path)) return "0B";
  const result = await $`du -sh ${path}`.text();
  return result.split("\t")[0];
}

// Helper to find vendor files
async function findVendorFile(vendorName) {
  try {
    const apps = ["console", "profile", "search", "auth"];
    for (const app of apps) {
      const assetsPath = join("apps", app, "dist", "assets");
      if (!existsSync(assetsPath)) continue;

      const files = await readdir(assetsPath);
      const vendorFile = files.find(f => f.startsWith(`${vendorName}-`) && f.endsWith(".js"));
      if (vendorFile) {
        return join(assetsPath, vendorFile);
      }
    }
  } catch (error) {
    // Vendor file not found
  }
  return null;
}

console.log("🧹 Cleaning public directory...");
await $`rm -rf public`;
await $`mkdir -p public/wasm public/shared`;

console.log("📦 Copying app builds...");

// Copy auth app (complete with WASM files and service worker)
console.log("  ├─ auth (with WASM + Service Worker)");
await $`mkdir -p public/auth`;
if (existsSync("apps/auth/dist")) {
  await $`cp -r apps/auth/dist/* public/auth/`;
}

// Copy console, profile, search apps
for (const app of ["console", "profile", "search"]) {
  console.log(`  ├─ ${app}`);
  await $`mkdir -p public/${app}`;
  if (existsSync(`apps/${app}/dist`)) {
    await $`cp -r apps/${app}/dist/* public/${app}/`;
  }
}

console.log("♻️  Extracting shared vendor chunks...");

// Find and copy vendor chunks to shared directory
const vendors = ["vendor-react", "vendor-router", "vendor-query", "vendor-ui"];
for (const vendor of vendors) {
  const vendorFile = await findVendorFile(vendor);
  if (vendorFile) {
    const fileName = vendorFile.split("/").pop();
    await $`cp ${vendorFile} public/shared/`;
    console.log(`  ✓ Extracted ${fileName}`);
  }
}

console.log("🔧 Copying WASM files...");
const wasmFiles = [
  { src: "libs/vault/dist/vault.wasm", dest: "public/wasm/vault.wasm", label: "vault.wasm (6.8MB)" },
  { src: "libs/enclave/dist/enclave.wasm", dest: "public/wasm/enclave.wasm", label: "enclave.wasm (8.6MB)" },
  { src: "libs/vault/dist/wasm_exec.js", dest: "public/wasm/wasm_exec.js", label: "wasm_exec.js" },
];

for (const { src, dest, label } of wasmFiles) {
  if (existsSync(src)) {
    await $`cp ${src} ${dest}`;
    console.log(`  ✓ ${label}`);
  }
}

// Copy WASM files to root for auth app (required for service worker)
const authWasmFiles = [
  { src: "apps/auth/dist/sw.js", dest: "public/sw.js" },
  { src: "apps/auth/dist/wasm_exec.js", dest: "public/wasm_exec.js" },
  { src: "apps/auth/dist/vault.wasm", dest: "public/vault.wasm" },
  { src: "apps/auth/dist/enclave.wasm", dest: "public/enclave.wasm" },
];

for (const { src, dest } of authWasmFiles) {
  if (existsSync(src)) {
    await $`cp ${src} ${dest}`.quiet();
  }
}

console.log("🎨 Copying shared assets (favicons, manifests)...");
const configPublic = "pkgs/config/public";
if (existsSync(configPublic)) {
  const assetExts = ["png", "ico", "svg", "txt", "webmanifest"];
  for (const ext of assetExts) {
    await $`cp ${configPublic}/*.${ext} public/ 2>/dev/null || true`.quiet();
  }
}
console.log("  ✓ Favicons, PWA icons, robots.txt");

console.log("");
console.log("✨ Bundle complete!");
console.log("");
console.log("📊 Build Summary:");

// Print sizes for each directory
const dirs = ["auth", "console", "profile", "search", "shared", "wasm"];
for (const dir of dirs) {
  const size = await getDirectorySize(`public/${dir}`);
  const label = dir.charAt(0).toUpperCase() + dir.slice(1);
  console.log(`  ${label.padEnd(10)} ${size}`);
}

console.log("");
const totalSize = await getDirectorySize("public");
console.log(`  Total:     ${totalSize}`);
