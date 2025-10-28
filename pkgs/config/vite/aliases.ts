import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Generates path aliases for all monorepo packages
 *
 * @param monoRepoRoot - Absolute path to the monorepo root (default: auto-detected from config package location)
 * @returns Record of alias mappings for Vite resolve.alias configuration
 *
 * @example
 * ```ts
 * import { createMonoRepoAliases } from '@sonr.io/config/vite/aliases';
 *
 * export default defineConfig({
 *   resolve: {
 *     alias: {
 *       '@': resolve(import.meta.dirname, './src'),
 *       ...createMonoRepoAliases(),
 *     },
 *   },
 * });
 * ```
 */
export function createMonoRepoAliases(
  monoRepoRoot?: string,
): Record<string, string> {
  // Auto-detect monorepo root if not provided
  // Use Bun's import.meta.dirname if available, otherwise fallback to fileURLToPath
  // pkgs/config/vite/aliases.ts -> ../../../ (monorepo root)
  let currentDir: string;
  if (typeof import.meta.dirname !== 'undefined') {
    currentDir = import.meta.dirname;
  } else if (import.meta.url) {
    currentDir = fileURLToPath(new URL('.', import.meta.url));
  } else {
    currentDir = process.cwd();
  }

  const root = monoRepoRoot || resolve(currentDir, '../../../');

  // Apps (apps/*)
  const apps = ['auth', 'console', 'payment', 'profile', 'search', 'welcome'];

  // Libs (libs/*)
  const libs = ['enclave', 'vault'];

  // Pkgs (pkgs/*)
  const pkgs = ['browser', 'config', 'react', 'sdk', 'ui'];

  const aliases: Record<string, string> = {};

  // Create aliases for apps
  for (const app of apps) {
    aliases[`@${app}`] = resolve(root, `apps/${app}/src`);
    aliases[`@${app}/*`] = resolve(root, `apps/${app}/src/*`);
  }

  // Create aliases for libs
  for (const lib of libs) {
    aliases[`@${lib}`] = resolve(root, `libs/${lib}/src`);
    aliases[`@${lib}/*`] = resolve(root, `libs/${lib}/src/*`);
  }

  // Create aliases for pkgs
  for (const pkg of pkgs) {
    aliases[`@${pkg}`] = resolve(root, `pkgs/${pkg}/src`);
    aliases[`@${pkg}/*`] = resolve(root, `pkgs/${pkg}/src/*`);
  }

  // Note: We do NOT create @sonr.io/* aliases because these are actual
  // workspace packages with proper package.json exports. The short-form
  // aliases above (@ui, @enclave, etc.) are for convenience only.

  return aliases;
}

/**
 * Default export for convenience
 */
export default createMonoRepoAliases;

/**
 * Available Aliases
 *
 * ## Apps (apps/*)
 * - `@auth` → apps/auth/src
 * - `@console` → apps/console/src
 * - `@payment` → apps/payment/src
 * - `@profile` → apps/profile/src
 * - `@search` → apps/search/src
 * - `@welcome` → apps/welcome/src
 *
 * ## Libs (libs/*)
 * - `@enclave` → libs/enclave/src
 * - `@vault` → libs/vault/src
 *
 * ## Pkgs (pkgs/*)
 * - `@browser` → pkgs/browser/src
 * - `@config` → pkgs/config
 * - `@react` → pkgs/react/src
 * - `@sdk` → pkgs/sdk/src
 * - `@ui` → pkgs/ui/src
 *
 * **Note**: These are short-form aliases only. For published packages,
 * always use the full `@sonr.io/package-name` import which resolves via
 * workspace package.json exports (to built dist files).
 *
 * ## Usage Examples
 *
 * ```ts
 * // Short-form aliases (for internal cross-package imports during development)
 * import { RpcClient } from '@sdk/client';
 * import { Button } from '@ui/components/button';
 * import { useSonr } from '@react/hooks/use-sonr';
 * import { createVaultClient } from '@enclave/client';
 *
 * // Full workspace package imports (for consuming built packages)
 * import { registerWithPasskey } from '@sonr.io/sdk/client';
 * import { Card } from '@sonr.io/ui';
 * import { SonrProvider } from '@sonr.io/react';
 * import type { EnclaveWorkerClient } from '@sonr.io/enclave/worker-client';
 * import { registerSW } from '@sonr.io/vault/register-sw';
 * ```
 */
