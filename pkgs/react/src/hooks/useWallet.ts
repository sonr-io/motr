/**
 * React hook for wallet connection state management
 * @module hooks/useWallet
 */

import { useState, useCallback } from 'react';

/**
 * Wallet connection state for useWallet hook
 */
export interface WalletState {
  /** Connected wallet address */
  address: string | null;
  /** Wallet connection status */
  isConnected: boolean;
  /** Wallet type (keplr, walletconnect, etc.) */
  walletType: string | null;
  /** Is connection in progress */
  isConnecting: boolean;
}

/**
 * Wallet connection options
 */
export interface ConnectWalletOptions {
  /** Wallet type to connect */
  walletType?: 'keplr' | 'walletconnect' | 'metamask';
  /** Chain ID to connect to */
  chainId?: string;
}

/**
 * Result of useWallet hook
 */
export interface UseWalletResult extends WalletState {
  /** Connect wallet function */
  connect: (options?: ConnectWalletOptions) => Promise<void>;
  /** Disconnect wallet function */
  disconnect: () => void;
  /** Error message if connection failed */
  error: string | null;
}

/**
 * Connects to wallet (placeholder implementation)
 */
async function connectWallet(
  options?: ConnectWalletOptions,
): Promise<{ address: string; walletType: string }> {
  // Placeholder implementation - will be replaced with actual SDK call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    address: 'sonr1' + Math.random().toString(36).substring(2, 15),
    walletType: options?.walletType ?? 'keplr',
  };
}

/**
 * React hook for managing wallet connection state
 *
 * Provides wallet connection status and methods to connect/disconnect.
 *
 * @example
 * ```tsx
 * function WalletButton() {
 *   const { isConnected, address, connect, disconnect, isConnecting, error } = useWallet();
 *
 *   if (isConnecting) {
 *     return <button disabled>Connecting...</button>;
 *   }
 *
 *   if (isConnected) {
 *     return (
 *       <div>
 *         <p>Connected: {address}</p>
 *         <button onClick={disconnect}>Disconnect</button>
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={() => connect({ walletType: 'keplr' })}>
 *         Connect Keplr
 *       </button>
 *       {error && <p className="error">{error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWallet(): UseWalletResult {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    walletType: null,
    isConnecting: false,
  });
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (options?: ConnectWalletOptions) => {
    setState((prev) => ({ ...prev, isConnecting: true }));
    setError(null);

    try {
      const result = await connectWallet(options);
      setState({
        address: result.address,
        isConnected: true,
        walletType: result.walletType,
        isConnecting: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      setState((prev) => ({ ...prev, isConnecting: false }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      walletType: null,
      isConnecting: false,
    });
    setError(null);
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    error,
  };
}
