#!/usr/bin/env bun
/**
 * Generate wasm_exec.js wrapper for SDK
 *
 * This script reads wasm_exec.js from the Go installation and generates
 * a TypeScript module that embeds its content as a string constant.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const srcDir = join(import.meta.dir, '..', 'src');
const wasmDir = join(srcDir, 'wasm');
const outputPath = join(wasmDir, 'wasm-exec-content.ts');

try {
  // Get GOROOT
  let goRoot: string;
  try {
    goRoot = execSync('go env GOROOT', { encoding: 'utf-8' }).trim();
  } catch {
    console.error('❌ Failed to get GOROOT. Is Go installed?');
    process.exit(1);
  }

  // Try multiple possible locations for wasm_exec.js
  const possiblePaths = [
    join(goRoot, 'lib', 'wasm', 'wasm_exec.js'),
    join(goRoot, 'misc', 'wasm', 'wasm_exec.js'),
  ];

  let wasmExecPath: string | null = null;
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      wasmExecPath = path;
      break;
    }
  }

  if (!wasmExecPath) {
    console.error('❌ Failed to find wasm_exec.js in Go installation');
    console.error('   Tried:');
    for (const path of possiblePaths) {
      console.error(`   - ${path}`);
    }
    process.exit(1);
  }

  // Read wasm_exec.js
  const wasmExecContent = readFileSync(wasmExecPath, 'utf-8');

  // Generate TypeScript module
  const tsContent = `/**
 * Auto-generated file - DO NOT EDIT
 * Generated from: ${wasmExecPath}
 * Generated at: ${new Date().toISOString()}
 * Run: bun scripts/gen-wasm-exec.ts
 *
 * This file contains the Go WebAssembly runtime (wasm_exec.js) embedded
 * as a TypeScript constant for use across the Sonr ecosystem.
 */

/**
 * The complete wasm_exec.js script content from the Go installation.
 * This ensures version compatibility between the Go compiler and runtime.
 * @internal
 */
export const WASM_EXEC_CONTENT = ${JSON.stringify(wasmExecContent)};
`;

  // Write output file
  writeFileSync(outputPath, tsContent, 'utf-8');

  console.log('✅ Generated wasm-exec-content.ts successfully');
  console.log(`   Source: ${wasmExecPath}`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${(wasmExecContent.length / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('❌ Failed to generate wasm-exec wrapper:', error);
  process.exit(1);
}
