/**
 * Type declarations for Cloudflare Workers environment
 */

// WASM module type
declare module "*.wasm" {
  const value: WebAssembly.Module;
  export default value;
}

// Raw text import (for wasm_exec.js)
declare module "*?raw" {
  const value: string;
  export default value;
}

// Go WASM runtime global
declare global {
  class Go {
    importObject: WebAssembly.Imports;
    run(instance: WebAssembly.Instance): Promise<void>;
  }
}

export {};
