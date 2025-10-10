import type { Plugin } from 'vite';
import { enclavePlugin, type EnclavePluginOptions } from '@sonr.io/enclave';

/**
 * Options for the ES package Vite plugin
 */
export interface ESPluginOptions extends EnclavePluginOptions {
  /**
   * Whether to enable the enclave plugin (default: true)
   */
  enableEnclave?: boolean;
}

/**
 * Vite plugin for @sonr.io/es that includes enclave autoloading
 */
export function esPlugin(options: ESPluginOptions = {}): Plugin {
  return enclavePlugin(options);
}