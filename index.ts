#!/usr/bin/env bun
/**
 * Motr Monorepo Orchestrator
 *
 * Single entry point for all development and build tasks across the monorepo.
 * Replaces Turborepo with a Bun-native implementation that respects the
 * dependency graph and runs tasks in the correct order.
 *
 * Usage:
 *   MODE=dev bun run index.ts     # Start all dev servers
 *   MODE=build bun run index.ts   # Build everything for production
 *   MODE=clean bun run index.ts   # Clean all build artifacts
 *
 * Environment Variables:
 *   MODE - Operation mode: 'dev' | 'build' | 'clean' | 'test' | 'lint' | 'typecheck'
 *   WORKSPACES - Comma-separated list of workspace names to include (default: all)
 *   VERBOSE - Set to '1' for detailed logging
 */

import { $ } from 'bun';
import { resolve } from 'path';
import { existsSync } from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const MODE = (process.env.MODE || 'build') as 'dev' | 'build' | 'clean' | 'test' | 'lint' | 'typecheck' | 'format' | 'check';
const VERBOSE = process.env.VERBOSE === '1';
const ROOT_DIR = import.meta.dir;

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Motr Monorepo Orchestrator

Usage:
  bun run index.ts                    # Build all workspaces (default)
  MODE=dev bun run index.ts           # Start all dev servers
  MODE=clean bun run index.ts         # Clean all build artifacts
  MODE=test bun run index.ts          # Run all tests
  MODE=lint bun run index.ts          # Lint all workspaces
  MODE=format bun run index.ts        # Format all code
  MODE=check bun run index.ts         # Run all checks (typecheck + lint)
  MODE=typecheck bun run index.ts     # Type check all workspaces

Environment Variables:
  MODE          - Operation mode (default: build)
                  Options: dev | build | clean | test | lint | format | check | typecheck
  WORKSPACES    - Comma-separated workspace names to include (default: all)
                  Example: WORKSPACES=@sonr.io/sdk,@sonr.io/ui MODE=build bun run index.ts
  VERBOSE       - Show detailed output (default: 0)
                  Example: VERBOSE=1 MODE=build bun run index.ts

Package.json Shortcuts:
  bun run build               # Build everything
  bun run dev                 # Build then start worker
  bun run dev:all             # Start all dev servers
  bun run clean               # Clean all artifacts
  bun run test                # Run all tests
  bun run lint                # Lint all code
  bun run format              # Format all code
  bun run check               # Run all checks
  bun run typecheck           # Type check all code

Examples:
  # Build only SDK and UI packages
  WORKSPACES=@sonr.io/sdk,@sonr.io/ui bun run index.ts

  # Build everything with verbose output
  VERBOSE=1 bun run index.ts

  # Clean and rebuild
  MODE=clean bun run index.ts && bun run index.ts

  # Start dev servers for frontend apps only
  WORKSPACES=@sonr.io/auth,@sonr.io/console MODE=dev bun run index.ts
`);
  process.exit(0);
}

// Workspace configuration with dependency graph
interface WorkspaceConfig {
  name: string;
  path: string;
  type: 'package' | 'wasm-lib' | 'vite-app' | 'aggregator' | 'worker';
  dependencies: string[]; // Workspace names this depends on
  buildCommand?: string;
  devCommand?: string;
  devPort?: number;
  cleanCommand?: string;
  testCommand?: string;
  lintCommand?: string;
  formatCommand?: string;
  checkCommand?: string;
  typecheckCommand?: string;
}

const WORKSPACES: WorkspaceConfig[] = [
  // ===== Layer 1: Base packages (no dependencies) =====
  {
    name: '@sonr.io/sdk',
    path: 'pkgs/sdk',
    type: 'package',
    dependencies: [],
    buildCommand: 'bun run gen && bunx tsc && bunx tsc-alias',
    devCommand: 'tsc --watch',
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },

  // ===== Layer 2: WASM libraries + UI (depend on sdk) =====
  {
    name: '@sonr.io/vault',
    path: 'libs/vault',
    type: 'wasm-lib',
    dependencies: ['@sonr.io/sdk'],
    buildCommand: 'devbox run wasm && vite build && bunx tsc && bunx tsc-alias',
    devCommand: 'vite',
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'bun run test:go && vitest run',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest . && ../../.devbox/nix/profile/default/bin/gofumpt -w .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check . && bunx tsc --noEmit',
    typecheckCommand: 'bunx tsc --noEmit',
  },
  {
    name: '@sonr.io/enclave',
    path: 'libs/enclave',
    type: 'wasm-lib',
    dependencies: ['@sonr.io/sdk'],
    buildCommand: 'devbox run wasm && vite build && bunx tsc && bunx tsc-alias',
    devCommand: 'vite',
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'go test ./... && vitest run',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest . && ../../.devbox/nix/profile/default/bin/gofumpt -w .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check . && bunx tsc --noEmit',
    typecheckCommand: 'bunx tsc --noEmit',
  },
  {
    name: '@sonr.io/ui',
    path: 'pkgs/ui',
    type: 'package',
    dependencies: ['@sonr.io/sdk'],
    buildCommand: 'bun scripts/generate-icons.ts && bunx tsc && bunx tsc-alias',
    devCommand: 'tsc --watch',
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run --passWithNoTests',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },
  {
    name: '@sonr.io/browser',
    path: 'pkgs/browser',
    type: 'package',
    dependencies: ['@sonr.io/sdk', '@sonr.io/vault', '@sonr.io/enclave'],
    buildCommand: 'bunx tsc && bunx tsc-alias && vite build',
    devCommand: 'vite',
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check . && bunx tsc --noEmit',
    typecheckCommand: 'bunx tsc --noEmit',
  },

  // ===== Layer 3: React library (depends on ui) =====
  {
    name: '@sonr.io/react',
    path: 'pkgs/react',
    type: 'package',
    dependencies: ['@sonr.io/ui'],
    buildCommand: 'bunx tsc && bunx tsc-alias',
    devCommand: 'bunx tsc --watch',
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run --passWithNoTests',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },

  // ===== Layer 4: Frontend apps (depend on react + enclave/vault) =====
  {
    name: '@sonr.io/auth',
    path: 'apps/auth',
    type: 'vite-app',
    dependencies: ['@sonr.io/react', '@sonr.io/vault', '@sonr.io/enclave'],
    buildCommand: 'bunx --bun vite build',
    devCommand: 'vite',
    devPort: 5173,
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run --passWithNoTests',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },
  {
    name: '@sonr.io/console',
    path: 'apps/console',
    type: 'vite-app',
    dependencies: ['@sonr.io/react', '@sonr.io/enclave'],
    buildCommand: 'bunx --bun vite build',
    devCommand: 'vite',
    devPort: 5174,
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run --passWithNoTests',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },
  {
    name: '@sonr.io/profile',
    path: 'apps/profile',
    type: 'vite-app',
    dependencies: ['@sonr.io/react', '@sonr.io/enclave'],
    buildCommand: 'bunx --bun vite build',
    devCommand: 'vite',
    devPort: 5175,
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run --passWithNoTests',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },
  {
    name: '@sonr.io/search',
    path: 'apps/search',
    type: 'vite-app',
    dependencies: ['@sonr.io/react', '@sonr.io/enclave'],
    buildCommand: 'bunx --bun vite build',
    devCommand: 'vite',
    devPort: 5176,
    cleanCommand: 'rm -rf dist *.tsbuildinfo .vite node_modules/.vite',
    testCommand: 'vitest run --passWithNoTests',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check .',
    typecheckCommand: 'bunx tsc --noEmit',
  },

  // ===== Layer 5: Asset aggregator (depends on all apps) =====
  {
    name: '@sonr.io/config',
    path: 'pkgs/config',
    type: 'aggregator',
    dependencies: ['@sonr.io/auth', '@sonr.io/console', '@sonr.io/profile', '@sonr.io/search', '@sonr.io/vault', '@sonr.io/enclave'],
    buildCommand: 'bun scripts/bundle-assets.js',
    cleanCommand: 'rm -rf ../../public',
  },

  // ===== Layer 6: Worker (depends on config) =====
  // Note: Worker TypeScript compilation is handled by Wrangler
  {
    name: '@sonr.io/worker',
    path: 'x/worker',
    type: 'worker',
    dependencies: ['@sonr.io/config'],
    devCommand: 'wrangler dev',
    cleanCommand: 'rm -rf .wrangler',
    lintCommand: 'bunx oxlint@latest .',
    formatCommand: 'bunx oxfmt@latest .',
    checkCommand: 'bunx oxlint@latest . && bunx oxfmt@latest --check . && bunx tsc --noEmit',
    typecheckCommand: 'bunx tsc --noEmit',
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Log with timestamp and color
 */
function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
  };
  const reset = '\x1b[0m';
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`${colors[level]}[${timestamp}]${reset} ${message}`);
}

/**
 * Get workspaces in topological order (dependencies first)
 */
function getTopologicalOrder(workspaces: WorkspaceConfig[]): WorkspaceConfig[] {
  const visited = new Set<string>();
  const result: WorkspaceConfig[] = [];

  function visit(workspace: WorkspaceConfig) {
    if (visited.has(workspace.name)) return;
    visited.add(workspace.name);

    // Visit all dependencies first
    for (const depName of workspace.dependencies) {
      const dep = workspaces.find((w) => w.name === depName);
      if (dep) visit(dep);
    }

    result.push(workspace);
  }

  for (const workspace of workspaces) {
    visit(workspace);
  }

  return result;
}

/**
 * Filter workspaces based on WORKSPACES environment variable
 */
function filterWorkspaces(workspaces: WorkspaceConfig[]): WorkspaceConfig[] {
  const filter = process.env.WORKSPACES;
  if (!filter || filter === 'all') return workspaces;

  const names = filter.split(',').map((n) => n.trim());
  return workspaces.filter((w) => names.includes(w.name));
}

/**
 * Run a command in a workspace directory
 */
async function runCommand(workspace: WorkspaceConfig, command: string, label: string): Promise<boolean> {
  const workspacePath = resolve(ROOT_DIR, workspace.path);

  if (!existsSync(workspacePath)) {
    log(`Workspace path does not exist: ${workspacePath}`, 'warn');
    return false;
  }

  log(`${label} ${workspace.name}`, 'info');

  try {
    if (VERBOSE) {
      await $`sh -c "cd ${workspacePath} && ${command}"`;
    } else {
      await $`sh -c "cd ${workspacePath} && ${command}"`.quiet();
    }
    log(`✓ ${workspace.name}`, 'success');
    return true;
  } catch (error) {
    log(`✗ ${workspace.name} failed`, 'error');
    if (VERBOSE && error instanceof Error) {
      console.error(error.message);
    }
    return false;
  }
}

// ============================================================================
// Mode Handlers
// ============================================================================

/**
 * Development mode - start all dev servers in parallel
 */
async function devMode() {
  log('Starting development mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const devWorkspaces = workspaces.filter((w) => w.devCommand);

  if (devWorkspaces.length === 0) {
    log('No workspaces with dev commands found', 'warn');
    return;
  }

  log(`Starting ${devWorkspaces.length} dev servers...`, 'info');
  log('', 'info');

  // Start all dev servers in parallel
  const processes = devWorkspaces.map(async (workspace) => {
    const workspacePath = resolve(ROOT_DIR, workspace.path);
    const command = workspace.devCommand!;

    log(`Starting ${workspace.name}${workspace.devPort ? ` on port ${workspace.devPort}` : ''}`, 'info');

    try {
      const proc = Bun.spawn({
        cmd: ['sh', '-c', `cd ${workspacePath} && ${command}`],
        stdout: 'inherit',
        stderr: 'inherit',
        env: {
          ...process.env,
          ...(workspace.devPort ? { PORT: workspace.devPort.toString() } : {}),
        },
      });

      return proc;
    } catch (error) {
      log(`Failed to start ${workspace.name}`, 'error');
      throw error;
    }
  });

  log('', 'info');
  log('✨ All dev servers started!', 'success');
  log('Press Ctrl+C to stop all servers', 'info');

  // Wait for all processes
  await Promise.all(processes);
}

/**
 * Build mode - build all workspaces in dependency order
 */
async function buildMode() {
  log('Starting build mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const orderedWorkspaces = getTopologicalOrder(workspaces);
  const buildWorkspaces = orderedWorkspaces.filter((w) => w.buildCommand);

  log(`Building ${buildWorkspaces.length} workspaces in dependency order...`, 'info');
  log('', 'info');

  let successCount = 0;
  let failCount = 0;

  for (const workspace of buildWorkspaces) {
    const success = await runCommand(workspace, workspace.buildCommand!, '📦');
    if (success) {
      successCount++;
    } else {
      failCount++;
      if (!VERBOSE) {
        log('Run with VERBOSE=1 for detailed error output', 'warn');
      }
      // Continue building other workspaces even if one fails
    }
  }

  log('', 'info');
  if (failCount === 0) {
    log(`✅ All ${successCount} workspaces built successfully!`, 'success');
  } else {
    log(`⚠️  Build completed with ${successCount} successes and ${failCount} failures`, 'warn');
    process.exit(1);
  }
}

/**
 * Clean mode - clean all build artifacts
 */
async function cleanMode() {
  log('Starting clean mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const cleanWorkspaces = workspaces.filter((w) => w.cleanCommand);

  log(`Cleaning ${cleanWorkspaces.length} workspaces...`, 'info');
  log('', 'info');

  // Clean root public directory first
  if (existsSync(resolve(ROOT_DIR, 'public'))) {
    log('Cleaning root public directory...', 'info');
    await $`rm -rf ${resolve(ROOT_DIR, 'public')}`.quiet();
  }

  // Clean all workspaces in parallel
  await Promise.all(
    cleanWorkspaces.map((workspace) =>
      runCommand(workspace, workspace.cleanCommand!, '🧹')
    )
  );

  log('', 'info');
  log('✅ All workspaces cleaned!', 'success');
}

/**
 * Test mode - run tests in all workspaces
 */
async function testMode() {
  log('Starting test mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const testWorkspaces = workspaces.filter((w) => w.testCommand);

  log(`Testing ${testWorkspaces.length} workspaces...`, 'info');
  log('', 'info');

  let successCount = 0;
  let failCount = 0;

  for (const workspace of testWorkspaces) {
    const success = await runCommand(workspace, workspace.testCommand!, '🧪');
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  log('', 'info');
  if (failCount === 0) {
    log(`✅ All ${successCount} test suites passed!`, 'success');
  } else {
    log(`❌ ${failCount} test suite(s) failed`, 'error');
    process.exit(1);
  }
}

/**
 * Lint mode - run linters in all workspaces
 */
async function lintMode() {
  log('Starting lint mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const lintWorkspaces = workspaces.filter((w) => w.lintCommand);

  log(`Linting ${lintWorkspaces.length} workspaces...`, 'info');
  log('', 'info');

  let successCount = 0;
  let failCount = 0;

  for (const workspace of lintWorkspaces) {
    const success = await runCommand(workspace, workspace.lintCommand!, '🔍');
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  log('', 'info');
  if (failCount === 0) {
    log(`✅ All ${successCount} workspaces passed linting!`, 'success');
  } else {
    log(`❌ ${failCount} workspace(s) failed linting`, 'error');
    process.exit(1);
  }
}

/**
 * Format mode - format code in all workspaces
 */
async function formatMode() {
  log('Starting format mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const formatWorkspaces = workspaces.filter((w) => w.formatCommand);

  log(`Formatting ${formatWorkspaces.length} workspaces...`, 'info');
  log('', 'info');

  await Promise.all(
    formatWorkspaces.map((workspace) =>
      runCommand(workspace, workspace.formatCommand!, '✨')
    )
  );

  log('', 'info');
  log('✅ All workspaces formatted!', 'success');
}

/**
 * Check mode - run all checks (typecheck + lint)
 */
async function checkMode() {
  log('Starting check mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const checkWorkspaces = workspaces.filter((w) => w.checkCommand);

  log(`Checking ${checkWorkspaces.length} workspaces...`, 'info');
  log('', 'info');

  let successCount = 0;
  let failCount = 0;

  for (const workspace of checkWorkspaces) {
    const success = await runCommand(workspace, workspace.checkCommand!, '✓');
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  log('', 'info');
  if (failCount === 0) {
    log(`✅ All ${successCount} workspaces passed checks!`, 'success');
  } else {
    log(`❌ ${failCount} workspace(s) failed checks`, 'error');
    process.exit(1);
  }
}

/**
 * Typecheck mode - run type checking in all workspaces
 */
async function typecheckMode() {
  log('Starting typecheck mode...', 'info');
  log('', 'info');

  const workspaces = filterWorkspaces(WORKSPACES);
  const typecheckWorkspaces = workspaces.filter((w) => w.typecheckCommand);

  log(`Type checking ${typecheckWorkspaces.length} workspaces...`, 'info');
  log('', 'info');

  let successCount = 0;
  let failCount = 0;

  for (const workspace of typecheckWorkspaces) {
    const success = await runCommand(workspace, workspace.typecheckCommand!, '📘');
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  log('', 'info');
  if (failCount === 0) {
    log(`✅ All ${successCount} workspaces passed type checking!`, 'success');
  } else {
    log(`❌ ${failCount} workspace(s) failed type checking`, 'error');
    process.exit(1);
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  const wasExplicitMode = !!process.env.MODE;

  if (!wasExplicitMode) {
    log('ℹ️  No MODE specified, defaulting to build. Use MODE=dev for development.', 'info');
  }

  log(`Motr Monorepo Orchestrator - Mode: ${MODE}`, 'info');

  switch (MODE) {
    case 'dev':
      await devMode();
      break;
    case 'build':
      await buildMode();
      break;
    case 'clean':
      await cleanMode();
      break;
    case 'test':
      await testMode();
      break;
    case 'lint':
      await lintMode();
      break;
    case 'format':
      await formatMode();
      break;
    case 'check':
      await checkMode();
      break;
    case 'typecheck':
      await typecheckMode();
      break;
    default:
      log(`Unknown mode: ${MODE}`, 'error');
      log('Valid modes: dev, build, clean, test, lint, format, check, typecheck', 'info');
      log('Run with --help for usage information', 'info');
      process.exit(1);
  }
}

main().catch((error) => {
  log(`Fatal error: ${error.message}`, 'error');
  if (VERBOSE) {
    console.error(error);
  }
  process.exit(1);
});
