import {
  createVaultClient,
  type VaultClient,
  VaultError,
} from "@sonr.io/enclave";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { EnclaveProviderProps, EnclaveState } from "../types";

/**
 * Enclave context value
 */
interface EnclaveContextValue extends EnclaveState {
  client: VaultClient | null;
  initialize: (wasmPath?: string, accountAddress?: string) => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Enclave context
 */
const EnclaveContext = createContext<EnclaveContextValue | undefined>(
  undefined,
);

/**
 * Enclave provider component
 * Manages enclave client lifecycle and state
 */
export function EnclaveProvider({
  children,
  config,
  client: externalClient,
}: EnclaveProviderProps) {
  const [client, setClient] = useState<VaultClient | null>(
    externalClient || null,
  );
  const [state, setState] = useState<EnclaveState>({
    isReady: false,
    isInitialized: false,
    accountAddress: null,
    error: null,
  });

  /**
   * Initialize the enclave client
   */
  const initialize = useCallback(
    async (wasmPath?: string, accountAddress?: string) => {
      try {
        setState((prev) => ({ ...prev, error: null }));

        let enclaveClient = client;

        // Create new client if not provided
        if (!enclaveClient) {
          enclaveClient = createVaultClient(config);
          setClient(enclaveClient);
        }

        // Initialize the client
        const path = wasmPath || config?.wasmPath;
        await enclaveClient.initialize(path, accountAddress);

        setState({
          isReady: enclaveClient.isReady(),
          isInitialized: true,
          accountAddress: accountAddress || null,
          error: null,
        });
      } catch (error) {
        const vaultError =
          error instanceof VaultError ? error : new Error(String(error));
        setState((prev) => ({
          ...prev,
          isReady: false,
          error: vaultError as Error,
        }));
        throw error;
      }
    },
    [client, config],
  );

  /**
   * Cleanup enclave resources
   */
  const cleanup = useCallback(async () => {
    if (client) {
      await client.cleanup();
      setState({
        isReady: false,
        isInitialized: false,
        accountAddress: null,
        error: null,
      });
    }
  }, [client]);

  /**
   * Auto-initialize if configured
   */
  useEffect(() => {
    if (config?.autoInitialize && !state.isInitialized && !externalClient) {
      initialize(config.wasmPath).catch((error) => {
        console.error("Failed to auto-initialize enclave:", error);
      });
    }
  }, [
    config?.autoInitialize,
    config?.wasmPath,
    state.isInitialized,
    externalClient,
    initialize,
  ]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (!externalClient && client) {
        cleanup().catch((error) => {
          console.error("Failed to cleanup enclave:", error);
        });
      }
    };
  }, [externalClient, client, cleanup]);

  const value: EnclaveContextValue = {
    ...state,
    client,
    initialize,
    cleanup,
  };

  return (
    <EnclaveContext.Provider value={value}>{children}</EnclaveContext.Provider>
  );
}

/**
 * Hook to access enclave context
 */
export function useEnclaveContext(): EnclaveContextValue {
  const context = useContext(EnclaveContext);
  if (!context) {
    throw new Error("useEnclaveContext must be used within an EnclaveProvider");
  }
  return context;
}
