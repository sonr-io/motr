import { useEnclaveContext } from "../providers/EnclaveProvider";
import type { EnclaveState } from "../types";

/**
 * Hook result for enclave operations
 */
export interface UseEnclaveResult extends EnclaveState {
  initialize: (wasmPath?: string, accountAddress?: string) => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Hook for accessing enclave state and operations
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isReady, initialize, cleanup } = useEnclave();
 *
 *   useEffect(() => {
 *     initialize('/vault.wasm', 'sonr1abc...');
 *   }, []);
 *
 *   return <div>Enclave Ready: {isReady ? 'Yes' : 'No'}</div>;
 * }
 * ```
 */
export function useEnclave(): UseEnclaveResult {
  const context = useEnclaveContext();

  return {
    isReady: context.isReady,
    isInitialized: context.isInitialized,
    accountAddress: context.accountAddress,
    error: context.error,
    initialize: context.initialize,
    cleanup: context.cleanup,
  };
}
