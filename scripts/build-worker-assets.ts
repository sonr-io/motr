#!/usr/bin/env bun
/**
 * Worker Assets Aggregation Script
 *
 * Aggregates all built frontend app assets into public/ directory for Cloudflare Worker deployment.
 * This script runs AFTER turborepo builds all libs, pkgs, and apps.
 *
 * Steps:
 * 1. Clean public/ directory
 * 2. Copy built app dist/ directories to public/{app}/
 * 3. Copy WASM files from libs to public/wasm/
 *
 * Usage:
 *   bun scripts/build-worker-assets.ts
 *
 * Note: This eliminates the circular dependency that existed when @sonr.io/config
 * tried to build apps as part of its own build process.
 */

import { existsSync } from 'node:fs';
import { mkdir, rm, cp } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Get monorepo root (parent of scripts directory)
const MONOREPO_ROOT = resolve(import.meta.dirname, '..');
const PUBLIC_DIR = join(MONOREPO_ROOT, 'public');

// Apps to build and copy
const APPS = ['auth', 'console', 'profile', 'search'] as const;

// WASM libraries to copy
const WASM_LIBS = ['vault', 'enclave'] as const;

/**
 * Main build function
 */
async function main() {
  console.log('🚀 Aggregating worker assets...\n');

  // Step 1: Clean public directory
  await cleanPublicDir();

  // Step 2: Copy app dist directories to public/
  await copyAppAssets();

  // Step 3: Copy WASM files to public/
  await copyWasmAssets();

  console.log('\n✅ Worker assets aggregated successfully!');
  console.log(`   Output: ${PUBLIC_DIR}`);
}

/**
 * Clean the public directory
 */
async function cleanPublicDir() {
  console.log('🧹 Cleaning public directory...');

  if (existsSync(PUBLIC_DIR)) {
    await rm(PUBLIC_DIR, { recursive: true, force: true });
  }

  await mkdir(PUBLIC_DIR, { recursive: true });
  console.log('   ✓ Public directory cleaned\n');
}

/**
 * Copy app dist directories to public/
 */
async function copyAppAssets() {
  console.log('📂 Copying app assets to public/...');

  for (const app of APPS) {
    const appDistDir = join(MONOREPO_ROOT, 'apps', app, 'dist');
    const targetDir = join(PUBLIC_DIR, app);

    if (!existsSync(appDistDir)) {
      console.warn(`   ⚠️  ${app} dist directory not found, skipping`);
      continue;
    }

    await cp(appDistDir, targetDir, { recursive: true });
    console.log(`   ✓ Copied ${app} assets`);
  }

  console.log();
}

/**
 * Copy WASM files to public/
 */
async function copyWasmAssets() {
  console.log('🔧 Copying WASM assets to public/...');

  const wasmDir = join(PUBLIC_DIR, 'wasm');
  await mkdir(wasmDir, { recursive: true });

  for (const lib of WASM_LIBS) {
    const libDistDir = join(MONOREPO_ROOT, 'libs', lib, 'dist');

    if (!existsSync(libDistDir)) {
      console.warn(`   ⚠️  ${lib} dist directory not found, skipping`);
      continue;
    }

    // Copy all .wasm and .js files from lib dist
    const libFiles = await Array.fromAsync(
      new Bun.Glob('*.{wasm,js}').scan({
        cwd: libDistDir,
        onlyFiles: true,
      })
    );

    for (const file of libFiles) {
      const srcPath = join(libDistDir, file);
      const destPath = join(wasmDir, file);
      await Bun.write(destPath, Bun.file(srcPath));
      console.log(`   ✓ Copied ${lib}/${file}`);
    }
  }

  console.log();
}

// Run main function
main().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
