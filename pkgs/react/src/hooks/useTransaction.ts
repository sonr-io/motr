import { useCallback, useState } from "react";
import type {
  BroadcastTxRequest,
  BroadcastTxResponse,
  SignDataRequest,
  SignDataResponse,
  UseMutationResult,
} from "../types";
import { useEnclaveClient } from "./useVaultClient";

/**
 * Hook for signing data with the enclave
 *
 * @example
 * ```tsx
 * function SignMessage() {
 *   const { mutate: sign, isLoading, data } = useSignData();
 *
 *   const handleSign = () => {
 *     const message = new TextEncoder().encode('Hello, Sonr!');
 *     sign({ data: message });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSign} disabled={isLoading}>
 *         {isLoading ? 'Signing...' : 'Sign Message'}
 *       </button>
 *       {data && <p>Signature: {Buffer.from(data.signature).toString('hex')}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSignData(): UseMutationResult<
  SignDataResponse,
  SignDataRequest
> {
  const { signData: vaultSignData } = useEnclaveClient();
  const [data, setData] = useState<SignDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (request: SignDataRequest): Promise<SignDataResponse> => {
      setIsLoading(true);
      setIsPending(true);
      setIsError(false);
      setError(null);
      setIsSuccess(false);

      try {
        const response = await vaultSignData(request);
        setData(response);
        setIsSuccess(true);
        return response;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setIsError(true);
        throw error;
      } finally {
        setIsLoading(false);
        setIsPending(false);
      }
    },
    [vaultSignData],
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    data,
    isLoading,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

/**
 * Hook for broadcasting transactions
 *
 * @example
 * ```tsx
 * function BroadcastTransaction() {
 *   const { mutate: broadcast, isLoading, data } = useBroadcastTx();
 *
 *   const handleBroadcast = async () => {
 *     const txBytes = new Uint8Array([...]); // Your transaction bytes
 *     const result = await broadcast({ txBytes, mode: 'sync' });
 *     console.log('Transaction hash:', result.txHash);
 *   };
 *
 *   return (
 *     <button onClick={handleBroadcast} disabled={isLoading}>
 *       {isLoading ? 'Broadcasting...' : 'Broadcast Transaction'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useBroadcastTx(): UseMutationResult<
  BroadcastTxResponse,
  BroadcastTxRequest
> {
  const [data, setData] = useState<BroadcastTxResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (_request: BroadcastTxRequest): Promise<BroadcastTxResponse> => {
      setIsLoading(true);
      setIsPending(true);
      setIsError(false);
      setError(null);
      setIsSuccess(false);

      try {
        // TODO: Implement actual transaction broadcasting using SDK
        // This is a placeholder implementation
        const response: BroadcastTxResponse = {
          txHash: "placeholder_hash",
          code: 0,
        };

        setData(response);
        setIsSuccess(true);
        return response;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setIsError(true);
        throw error;
      } finally {
        setIsLoading(false);
        setIsPending(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setIsPending(false);
    setIsSuccess(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    data,
    isLoading,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  };
}

/**
 * Combined hook for signing and broadcasting transactions
 *
 * @example
 * ```tsx
 * function TransactionFlow() {
 *   const { sign, broadcast, isLoading } = useTransaction();
 *
 *   const handleTransaction = async () => {
 *     // 1. Sign the transaction
 *     const message = new TextEncoder().encode('Transaction data');
 *     const signResult = await sign({ data: message });
 *
 *     // 2. Broadcast the signed transaction
 *     const txBytes = new Uint8Array([...]); // Build tx with signature
 *     const broadcastResult = await broadcast({ txBytes });
 *
 *     console.log('Transaction hash:', broadcastResult.txHash);
 *   };
 *
 *   return (
 *     <button onClick={handleTransaction} disabled={isLoading}>
 *       {isLoading ? 'Processing...' : 'Send Transaction'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTransaction() {
  const signMutation = useSignData();
  const broadcastMutation = useBroadcastTx();

  const isLoading = signMutation.isLoading || broadcastMutation.isLoading;
  const isError = signMutation.isError || broadcastMutation.isError;
  const error = signMutation.error || broadcastMutation.error;

  const reset = useCallback(() => {
    signMutation.reset();
    broadcastMutation.reset();
  }, [signMutation, broadcastMutation]);

  return {
    sign: signMutation.mutate,
    broadcast: broadcastMutation.mutate,
    signData: signMutation.data,
    broadcastData: broadcastMutation.data,
    isLoading,
    isError,
    error,
    reset,
  };
}
