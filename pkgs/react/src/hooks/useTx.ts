/**
 * React Query mutation hook for transaction submission
 * @module hooks/useTx
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { balanceKeys } from './useBalance.js';
import { accountKeys } from './useAccount.js';

/**
 * Transaction message to broadcast
 */
export interface TxMessage {
  typeUrl: string;
  value: unknown;
}

/**
 * Transaction options
 */
export interface TxOptions {
  /** Transaction messages */
  messages: TxMessage[];
  /** Transaction memo */
  memo?: string;
  /** Gas limit */
  gas?: string;
  /** Fee amount */
  fee?: {
    denom: string;
    amount: string;
  };
}

/**
 * Transaction result from blockchain
 */
export interface TxResult {
  /** Transaction hash */
  txHash: string;
  /** Block height */
  height: string;
  /** Transaction code (0 = success) */
  code: number;
  /** Raw log output */
  rawLog: string;
}

/**
 * Options for useTx mutation
 */
export interface UseTxOptions {
  /** RPC endpoint URL */
  rpcUrl?: string;
  /** Address to invalidate queries for */
  address?: string;
  /** Success callback */
  onSuccess?: (data: TxResult) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Broadcasts transaction to blockchain
 */
async function broadcastTx(
  _tx: TxOptions,
  _rpcUrl?: string,
): Promise<TxResult> {
  // Placeholder implementation - will be replaced with actual SDK call
  return {
    txHash: '0x' + Math.random().toString(16).substring(2),
    height: '1',
    code: 0,
    rawLog: 'Transaction successful',
  };
}

/**
 * React Query mutation hook for submitting transactions to Sonr blockchain
 *
 * Automatically invalidates relevant queries on success for optimistic UI updates.
 *
 * @example
 * ```tsx
 * function SendTokens({ fromAddress }: { fromAddress: string }) {
 *   const { mutate: sendTx, isPending, isError } = useTx({
 *     address: fromAddress,
 *     onSuccess: (result) => {
 *       console.log('Transaction successful:', result.txHash);
 *     },
 *   });
 *
 *   const handleSend = () => {
 *     sendTx({
 *       messages: [{
 *         typeUrl: '/cosmos.bank.v1beta1.MsgSend',
 *         value: {
 *           fromAddress,
 *           toAddress: 'sonr1...',
 *           amount: [{ denom: 'usnr', amount: '1000' }],
 *         },
 *       }],
 *       memo: 'Test transaction',
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleSend} disabled={isPending}>
 *       {isPending ? 'Sending...' : 'Send Tokens'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTx(
  options: UseTxOptions = {},
): UseMutationResult<TxResult, Error, TxOptions> {
  const { rpcUrl, address, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tx: TxOptions) => broadcastTx(tx, rpcUrl),
    onSuccess: (data) => {
      // Invalidate balance and account queries for optimistic updates
      if (address) {
        queryClient.invalidateQueries({ queryKey: balanceKeys.detail(address) });
        queryClient.invalidateQueries({ queryKey: accountKeys.detail(address) });
      }
      onSuccess?.(data);
    },
    onError,
  });
}
