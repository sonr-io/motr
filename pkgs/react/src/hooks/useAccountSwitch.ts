import { useCallback, useEffect, useState } from "react";
import { useEnclaveContext } from "../providers/EnclaveProvider";
import type { UseAccountSwitchResult } from "../types";

/**
 * Hook for switching between multiple accounts
 *
 * @example
 * ```tsx
 * function AccountSwitcher() {
 *   const { currentAccount, accounts, switchAccount, isLoading } = useAccountSwitch();
 *
 *   return (
 *     <select
 *       value={currentAccount || ''}
 *       onChange={(e) => switchAccount(e.target.value)}
 *       disabled={isLoading}
 *     >
 *       {accounts.map(address => (
 *         <option key={address} value={address}>{address}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useAccountSwitch(): UseAccountSwitchResult {
  const { client, isReady, accountAddress } = useEnclaveContext();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAccounts = useCallback(async () => {
    if (!client || !isReady) return;

    setIsLoading(true);
    try {
      const persistedAccounts = await client.listPersistedAccounts();
      setAccounts(persistedAccounts);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [client, isReady]);

  const switchAccount = useCallback(
    async (address: string) => {
      if (!client || !isReady) {
        throw new Error("Enclave client not initialized");
      }

      setIsLoading(true);
      try {
        await client.switchAccount(address);
        await loadAccounts();
      } catch (error) {
        console.error("Failed to switch account:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady, loadAccounts],
  );

  const removeAccount = useCallback(
    async (address: string) => {
      if (!client || !isReady) {
        throw new Error("Enclave client not initialized");
      }

      setIsLoading(true);
      try {
        await client.removeAccount(address);
        await loadAccounts();
      } catch (error) {
        console.error("Failed to remove account:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [client, isReady, loadAccounts],
  );

  // Load accounts on mount
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    currentAccount: accountAddress,
    accounts,
    isLoading,
    switchAccount,
    removeAccount,
  };
}
