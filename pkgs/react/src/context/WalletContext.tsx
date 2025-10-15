/**
 * React context for wallet state management
 * @module context/WalletContext
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/**
 * Wallet connection state for context
 */
export interface WalletContextState {
  /** Connected wallet address */
  address: string | null;
  /** Wallet display name */
  name: string | null;
  /** Is wallet connected */
  isConnected: boolean;
  /** Is connection in progress */
  isConnecting: boolean;
  /** Connection error */
  error: string | null;
}

/**
 * Wallet context value with state and methods
 */
export interface WalletContextValue extends WalletContextState {
  /** Connect wallet */
  connect: (address: string, name?: string) => Promise<void>;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Reset error state */
  clearError: () => void;
}

/**
 * Default wallet state
 */
const defaultWalletState: WalletContextState = {
  address: null,
  name: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

/**
 * Wallet context
 */
const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * Props for WalletProvider
 */
export interface WalletProviderProps {
  /** Child components */
  children: ReactNode;
  /** Callback when wallet connects */
  onConnect?: (address: string) => void;
  /** Callback when wallet disconnects */
  onDisconnect?: () => void;
  /** Callback when connection error occurs */
  onError?: (error: string) => void;
}

/**
 * Provider component for wallet state management.
 *
 * Manages wallet connection state and provides methods to connect/disconnect.
 *
 * @example
 * ```tsx
 * import { WalletProvider } from '@sonr.io/react';
 *
 * function App() {
 *   return (
 *     <WalletProvider
 *       onConnect={(address) => console.log('Connected:', address)}
 *       onDisconnect={() => console.log('Disconnected')}
 *     >
 *       <YourApp />
 *     </WalletProvider>
 *   );
 * }
 * ```
 */
export function WalletProvider({
  children,
  onConnect,
  onDisconnect,
  onError,
}: WalletProviderProps) {
  const [state, setState] = useState<WalletContextState>(defaultWalletState);

  const connect = useCallback(
    async (address: string, name?: string) => {
      setState((prev) => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      try {
        // Simulate connection delay (replace with actual wallet connection logic)
        await new Promise((resolve) => setTimeout(resolve, 500));

        setState({
          address,
          name: name ?? null,
          isConnected: true,
          isConnecting: false,
          error: null,
        });

        onConnect?.(address);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to connect wallet';

        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: errorMessage,
        }));

        onError?.(errorMessage);
        throw err;
      }
    },
    [onConnect, onError],
  );

  const disconnect = useCallback(() => {
    setState(defaultWalletState);
    onDisconnect?.();
  }, [onDisconnect]);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const value: WalletContextValue = {
    ...state,
    connect,
    disconnect,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context.
 *
 * Must be used within a WalletProvider.
 *
 * @example
 * ```tsx
 * function WalletButton() {
 *   const { connect, disconnect, isConnected, address, isConnecting } = useWalletContext();
 *
 *   if (isConnected) {
 *     return (
 *       <button onClick={disconnect}>
 *         Disconnect {address?.slice(0, 8)}...
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <button onClick={() => connect('sonr1...')} disabled={isConnecting}>
 *       {isConnecting ? 'Connecting...' : 'Connect Wallet'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @throws {Error} If used outside of WalletProvider
 */
export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }

  return context;
}
