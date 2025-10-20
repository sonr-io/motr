import type { StoredUCANToken, StoredVaultState } from "@sonr.io/enclave";
import { useCallback, useEffect, useState } from "react";
import { useEnclaveContext } from "../providers/EnclaveProvider";
import type { UseEnclaveStorageResult, UseUCANTokensResult } from "../types";

/**
 * Hook for managing enclave storage state
 *
 * @example
 * ```tsx
 * function EnclaveStorage() {
 *   const { state, persist, clear, isLoading } = useEnclaveStorage();
 *
 *   return (
 *     <div>
 *       <p>Initialized: {state?.isInitialized ? 'Yes' : 'No'}</p>
 *       <button onClick={persist} disabled={isLoading}>Persist State</button>
 *       <button onClick={clear} disabled={isLoading}>Clear State</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnclaveStorage(): UseEnclaveStorageResult {
  const { client, isReady } = useEnclaveContext();
  const [state, setState] = useState<StoredVaultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isReady) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const vaultState = await client.loadPersistedState();
      setState(vaultState);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, isReady]);

  const persist = useCallback(async () => {
    if (!client || !isReady) {
      throw new Error("Enclave client not initialized");
    }

    setIsLoading(true);
    setError(null);

    try {
      await client.persistState();
      await refetch();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, isReady, refetch]);

  const clear = useCallback(async () => {
    if (!client || !isReady) {
      throw new Error("Enclave client not initialized");
    }

    setIsLoading(true);
    setError(null);

    try {
      await client.clearPersistedState();
      setState(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, isReady]);

  // Load state on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    state,
    isLoading,
    isError,
    error,
    persist,
    clear,
    refetch,
  };
}

/**
 * Hook for managing UCAN tokens
 *
 * @example
 * ```tsx
 * function TokenList() {
 *   const { tokens, removeExpired, isLoading } = useUCANTokens();
 *
 *   return (
 *     <div>
 *       <h3>UCAN Tokens ({tokens.length})</h3>
 *       {tokens.map(token => (
 *         <div key={token.id}>{token.issuer}</div>
 *       ))}
 *       <button onClick={removeExpired} disabled={isLoading}>
 *         Remove Expired
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUCANTokens(): UseUCANTokensResult {
  const { client, isReady } = useEnclaveContext();
  const [tokens, setTokens] = useState<StoredUCANToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!client || !isReady) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const persistedTokens = await client.getPersistedTokens();
      setTokens(persistedTokens);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [client, isReady]);

  const removeExpired = useCallback(async () => {
    if (!client || !isReady) {
      throw new Error("Enclave client not initialized");
    }

    setIsLoading(true);
    setError(null);

    try {
      await client.removeExpiredTokens();
      await refetch();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, isReady, refetch]);

  // Load tokens on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    tokens,
    isLoading,
    isError,
    error,
    refetch,
    removeExpired,
  };
}
