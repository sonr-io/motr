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

  // Add special aliases for commonly used package names
  aliases['@sonr.io/sdk'] = resolve(root, 'pkgs/sdk/src');
  aliases['@sonr.io/ui'] = resolve(root, 'pkgs/ui/src');
  aliases['@sonr.io/react'] = resolve(root, 'pkgs/react/src');
  aliases['@sonr.io/browser'] = resolve(root, 'pkgs/browser/src');
  aliases['@sonr.io/config'] = resolve(root, 'pkgs/config');
  aliases['@sonr.io/enclave'] = resolve(root, 'libs/enclave/src');
  aliases['@sonr.io/vault'] = resolve(root, 'libs/vault/src');

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
 * ## Package-scoped aliases (also available)
 * - `@sonr.io/sdk` → pkgs/sdk/src
 * - `@sonr.io/ui` → pkgs/ui/src
 * - `@sonr.io/react` → pkgs/react/src
 * - `@sonr.io/browser` → pkgs/browser/src
 * - `@sonr.io/config` → pkgs/config
 * - `@sonr.io/enclave` → libs/enclave/src
 * - `@sonr.io/vault` → libs/vault/src
 *
 * ## Usage Examples
 *
 * ```ts
 * // Import from SDK
 * import { RpcClient } from '@sdk/client';
 * import { registerWithPasskey } from '@sonr.io/sdk/client';
 *
 * // Import from UI components
 * import { Button } from '@ui/components/button';
 * import { Card } from '@sonr.io/ui/components/card';
 *
 * // Import from React hooks
 * import { useSonr } from '@react/hooks/use-sonr';
 * import { SonrProvider } from '@sonr.io/react';
 *
 * // Import from Enclave
 * import { createVaultClient } from '@enclave/client';
 * import type { EnclaveWorkerClient } from '@sonr.io/enclave/worker-client';
 *
 * // Import from Vault
 * import { loadVault } from '@vault/loader';
 * import { registerSW } from '@sonr.io/vault/register-sw';
 * ```
 */
