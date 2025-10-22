/**
 * @sonr.io/sdk/wasm - Go WebAssembly Runtime Utilities
 *
 * Provides the wasm_exec.js runtime script and utilities for loading
 * Go WebAssembly modules across the Sonr ecosystem.
 *
 * @module @sonr.io/sdk/wasm
 */

/**
 * Get the Go WebAssembly runtime script (wasm_exec.js) content
 *
 * This function loads the wasm_exec.js script from the local Go installation
 * at build time and returns it as a string. This ensures version compatibility
 * between the compiled WASM binary and the runtime.
 *
 * @returns The wasm_exec.js script content as a string
 *
 * @example
 * ```ts
 * import { getWasmExecScript } from '@sonr.io/sdk/wasm';
 *
 * // For Cloudflare Workers
 * const wasmExecScript = getWasmExecScript();
 * const initGo = new Function(wasmExecScript);
 * initGo();
 * const go = new globalThis.Go();
 * ```
 */
export function getWasmExecScript(): string {
  // This will be replaced at build time with the actual script content
  // See scripts/gen-wasm-exec.ts
  return WASM_EXEC_CONTENT;
}

/**
 * Initialize the Go WebAssembly runtime in the global scope
 *
 * This function evaluates the wasm_exec.js script to make the Go runtime
 * available globally. After calling this, you can create new Go instances
 * with `new globalThis.Go()`.
 *
 * @example
 * ```ts
 * import { initGoRuntime } from '@sonr.io/sdk/wasm';
 *
 * // Initialize the runtime
 * initGoRuntime();
 *
 * // Now you can create Go instances
 * const go = new globalThis.Go();
 * ```
 */
export function initGoRuntime(): void {
  const script = getWasmExecScript();
  const init = new Function(script);
  init();
}

/**
 * Load and instantiate a Go WebAssembly module
 *
 * This is a convenience function that handles the full lifecycle:
 * 1. Initialize the Go runtime
 * 2. Create a Go instance
 * 3. Instantiate the WASM module
 * 4. Run the Go program
 *
 * @param wasmModule - The WebAssembly.Module or Response/Buffer to instantiate
 * @param goInstance - Optional pre-configured Go instance
 * @returns Promise that resolves to the instantiated WebAssembly instance
 *
 * @example
 * ```ts
 * import { loadGoWasm } from '@sonr.io/sdk/wasm';
 * import wasmModule from './vault.wasm';
 *
 * const instance = await loadGoWasm(wasmModule);
 * ```
 */
export async function loadGoWasm(
  wasmModule: WebAssembly.Module | BufferSource | Response,
  goInstance?: any,
): Promise<WebAssembly.Instance> {
  // Initialize runtime if not already done
  if (!globalThis.Go) {
    initGoRuntime();
  }

  // Create Go instance if not provided
  const go = goInstance || new globalThis.Go();

  // Instantiate WASM module
  let instance: WebAssembly.Instance;

  if (wasmModule instanceof WebAssembly.Module) {
    instance = await WebAssembly.instantiate(wasmModule, go.importObject);
  } else if (wasmModule instanceof Response) {
    const result = await WebAssembly.instantiateStreaming(
      wasmModule,
      go.importObject,
    );
    instance = result.instance;
  } else {
    const result = await WebAssembly.instantiate(wasmModule, go.importObject);
    instance = result.instance;
  }

  // Run the Go program (don't await - runs indefinitely)
  go.run(instance);

  return instance;
}

/**
 * Raw wasm_exec.js content (generated at build time)
 * @internal
 */
import { WASM_EXEC_CONTENT } from './wasm-exec-content';

// Type declarations for Go runtime
declare global {
  interface Window {
    Go: GoConstructor;
  }

  var Go: GoConstructor;
}

/**
 * Go constructor type for WebAssembly runtime
 */
interface GoConstructor {
  new (): GoInstance;
}

/**
 * Go instance type
 */
interface GoInstance {
  argv: string[];
  env: Record<string, string>;
  exit: (code: number) => void;
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
  mem: DataView;
  _inst?: WebAssembly.Instance;
  _values?: any[];
  _goRefCounts?: number[];
  _ids?: Map<any, number>;
  _idPool?: number[];
  exited?: boolean;
  _exitPromise?: Promise<void>;
  _resolveExitPromise?: () => void;
}

export default {
  getWasmExecScript,
  initGoRuntime,
  loadGoWasm,
};
