/**
 * WASM loader for Motor Vault service worker
 *
 * Provides utilities to load and initialize the Go WASM HTTP server
 * that powers the Payment Gateway and OIDC services.
 */

export interface VaultConfig {
  /** Path to the vault.wasm file */
  wasmPath?: string
  /** Path to the wasm_exec.js runtime */
  runtimePath?: string
  /** Environment variables to pass to the WASM module */
  env?: Record<string, string>
  /** Enable debug logging */
  debug?: boolean
}

/**
 * Load and initialize the Motor Vault WASM module
 *
 * @param config Configuration options
 * @returns Promise that resolves when the vault is ready
 *
 * @example
 * ```typescript
 * import { loadVault } from '@sonr.io/vault/loader'
 *
 * await loadVault({
 *   wasmPath: '/vault.wasm',
 *   debug: true
 * })
 * ```
 */
export async function loadVault(config: VaultConfig = {}): Promise<void> {
  const {
    wasmPath = '/vault.wasm',
    runtimePath = '/wasm_exec.js',
    env = {},
    debug = false
  } = config

  if (debug) {
    console.log('[Vault] Loading Motor vault WASM module...')
    console.log('[Vault] WASM path:', wasmPath)
    console.log('[Vault] Runtime path:', runtimePath)
  }

  // Load the Go WASM runtime
  if (typeof (globalThis as any).Go === 'undefined') {
    await loadWasmRuntime(runtimePath, debug)
  }

  // Initialize the Go WASM module
  const go = new (globalThis as any).Go()

  // Set environment variables
  go.env = { ...process.env, ...env }

  if (debug) {
    console.log('[Vault] Fetching WASM module...')
  }

  // Fetch and instantiate the WASM module
  const response = await fetch(wasmPath)
  const buffer = await response.arrayBuffer()
  const result = await WebAssembly.instantiate(buffer, go.importObject)

  if (debug) {
    console.log('[Vault] Starting WASM HTTP server...')
  }

  // Run the Go program (starts the HTTP server)
  go.run(result.instance)

  if (debug) {
    console.log('[Vault] Motor vault is ready')
  }
}

/**
 * Load the Go WASM runtime (wasm_exec.js)
 */
async function loadWasmRuntime(runtimePath: string, debug: boolean): Promise<void> {
  if (debug) {
    console.log('[Vault] Loading Go WASM runtime...')
  }

  // In browser environments, load via script tag
  if (typeof document !== 'undefined') {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = runtimePath
      script.onload = () => {
        if (debug) {
          console.log('[Vault] Go WASM runtime loaded')
        }
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // In Node.js or worker environments, use importScripts or dynamic import
  if (typeof importScripts !== 'undefined') {
    importScripts(runtimePath)
    if (debug) {
      console.log('[Vault] Go WASM runtime loaded via importScripts')
    }
    return
  }

  // Fallback: try dynamic import
  try {
    await import(/* @vite-ignore */ runtimePath)
    if (debug) {
      console.log('[Vault] Go WASM runtime loaded via dynamic import')
    }
  } catch (error) {
    console.error('[Vault] Failed to load Go WASM runtime:', error)
    throw new Error('Failed to load Go WASM runtime')
  }
}

/**
 * Helper to check if the vault is already loaded
 */
export function isVaultLoaded(): boolean {
  return typeof (globalThis as any).Go !== 'undefined'
}
