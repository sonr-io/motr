import type { Plugin } from 'vite';

export interface EnclavePluginOptions {
  /**
   * Path to the enclave.wasm file relative to the project root.
   * Defaults to 'dist/enclave.wasm'.
   */
  wasmPath?: string;
  /**
   * Virtual module ID for the WASM URL.
   * Defaults to 'virtual:enclave-wasm'.
   */
  virtualModuleId?: string;
}

export function enclavePlugin(options: EnclavePluginOptions = {}): Plugin {
  const { wasmPath = 'dist/enclave.wasm', virtualModuleId = 'virtual:enclave-wasm' } = options;

  return {
    name: 'vite-plugin-enclave',
    buildStart() {
      // Emit the WASM file as an asset
      this.emitFile({
        type: 'asset',
        fileName: wasmPath,
        source: '', // We'll resolve the actual file later
      });
    },
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return id;
      }
      return null;
    },
    load(id: string) {
      if (id === virtualModuleId) {
        // Return a module that exports the WASM URL
        return `export default new URL('${wasmPath}', import.meta.url).href;`;
      }
      return null;
    },
  };
}