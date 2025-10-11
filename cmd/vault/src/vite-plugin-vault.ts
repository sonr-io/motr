/**
 * Vite plugin for Motor Vault WASM service worker
 *
 * This plugin helps bundle and serve the vault.wasm and wasm_exec.js files
 * in Vite-based applications.
 */

import type { Plugin } from 'vite'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

export interface VaultPluginOptions {
  /**
   * Whether to copy WASM files to public directory
   * @default true
   */
  copyToPublic?: boolean

  /**
   * Public path for WASM files
   * @default '/vault'
   */
  publicPath?: string

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean
}

/**
 * Vite plugin for Motor Vault integration
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { vaultPlugin } from '@sonr.io/vault/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     vaultPlugin({
 *       publicPath: '/motor-vault'
 *     })
 *   ]
 * })
 * ```
 */
export function vaultPlugin(options: VaultPluginOptions = {}): Plugin {
  const {
    copyToPublic = true,
    publicPath = '/vault',
    debug = false
  } = options

  const __dirname = dirname(fileURLToPath(import.meta.url))
  const wasmPath = resolve(__dirname, '../dist/vault.wasm')
  const runtimePath = resolve(__dirname, '../dist/wasm_exec.js')

  return {
    name: 'vite-plugin-vault',

    config() {
      return {
        optimizeDeps: {
          exclude: ['@sonr.io/vault']
        },
        server: {
          fs: {
            allow: [resolve(__dirname, '..')]
          }
        }
      }
    },

    configureServer(server) {
      if (debug) {
        console.log('[VaultPlugin] Configuring dev server...')
      }

      // Serve WASM file
      server.middlewares.use(`${publicPath}/vault.wasm`, (req, res) => {
        try {
          const wasm = readFileSync(wasmPath)
          res.setHeader('Content-Type', 'application/wasm')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.end(wasm)
        } catch (error) {
          console.error('[VaultPlugin] Failed to serve vault.wasm:', error)
          res.statusCode = 404
          res.end('WASM file not found')
        }
      })

      // Serve WASM runtime
      server.middlewares.use(`${publicPath}/wasm_exec.js`, (req, res) => {
        try {
          const runtime = readFileSync(runtimePath, 'utf-8')
          res.setHeader('Content-Type', 'application/javascript')
          res.end(runtime)
        } catch (error) {
          console.error('[VaultPlugin] Failed to serve wasm_exec.js:', error)
          res.statusCode = 404
          res.end('WASM runtime not found')
        }
      })

      if (debug) {
        console.log(`[VaultPlugin] Vault WASM available at ${publicPath}/vault.wasm`)
        console.log(`[VaultPlugin] WASM runtime available at ${publicPath}/wasm_exec.js`)
      }
    },

    buildStart() {
      if (debug) {
        console.log('[VaultPlugin] Build started')
      }
    },

    generateBundle(options, bundle) {
      if (!copyToPublic) return

      if (debug) {
        console.log('[VaultPlugin] Adding WASM files to bundle...')
      }

      try {
        // Add WASM file to bundle
        const wasmContent = readFileSync(wasmPath)
        this.emitFile({
          type: 'asset',
          fileName: 'vault.wasm',
          source: wasmContent
        })

        // Add runtime to bundle
        const runtimeContent = readFileSync(runtimePath, 'utf-8')
        this.emitFile({
          type: 'asset',
          fileName: 'wasm_exec.js',
          source: runtimeContent
        })

        if (debug) {
          console.log('[VaultPlugin] WASM files added to bundle')
        }
      } catch (error) {
        console.error('[VaultPlugin] Failed to add WASM files to bundle:', error)
      }
    }
  }
}

export default vaultPlugin
