/**
 * Transaction button component with signing UI
 * @module components/TransactionButton
 */

import { type ReactNode } from 'react';
import { useTx, type TxOptions } from '../hooks/useTx.js';

/**
 * Props for TransactionButton component
 */
export interface TransactionButtonProps {
  /** Transaction to broadcast */
  tx: TxOptions;
  /** RPC endpoint URL */
  rpcUrl?: string;
  /** Address to invalidate queries for */
  address?: string;
  /** Button text */
  children?: ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Loading text */
  loadingText?: string;
  /** Success text */
  successText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Success callback */
  onSuccess?: (txHash: string) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Button component with built-in transaction signing and broadcasting.
 *
 * Handles loading states, success states, and error handling for blockchain transactions.
 *
 * @example
 * ```tsx
 * import { TransactionButton } from '@sonr.io/react';
 *
 * function SendTokens() {
 *   const tx = {
 *     messages: [{
 *       typeUrl: '/cosmos.bank.v1beta1.MsgSend',
 *       value: {
 *         fromAddress: 'sonr1...',
 *         toAddress: 'sonr1...',
 *         amount: [{ denom: 'usnr', amount: '1000' }],
 *       },
 *     }],
 *     memo: 'Test transaction',
 *   };
 *
 *   return (
 *     <TransactionButton
 *       tx={tx}
 *       address="sonr1..."
 *       onSuccess={(txHash) => console.log('Transaction successful:', txHash)}
 *       onError={(error) => console.error('Transaction failed:', error)}
 *     >
 *       Send Tokens
 *     </TransactionButton>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling and loading states
 * function StyledTransactionButton() {
 *   const tx = { messages: [...], memo: 'Transaction' };
 *
 *   return (
 *     <TransactionButton
 *       tx={tx}
 *       className="btn btn-primary"
 *       loadingText="Signing..."
 *       successText="Success!"
 *     >
 *       Submit Transaction
 *     </TransactionButton>
 *   );
 * }
 * ```
 */
export function TransactionButton({
  tx,
  rpcUrl,
  address,
  children = 'Submit Transaction',
  className = '',
  loadingText = 'Submitting...',
  successText = 'Transaction Successful',
  disabled = false,
  onSuccess,
  onError,
}: TransactionButtonProps) {
  const {
    mutate: submitTx,
    isPending,
    isSuccess,
    error,
  } = useTx({
    rpcUrl,
    address,
    onSuccess: (result) => {
      onSuccess?.(result.txHash);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const handleClick = () => {
    submitTx(tx);
  };

  // Show success state temporarily
  if (isSuccess) {
    return (
      <button className={`${className} success`} disabled>
        {successText}
      </button>
    );
  }

  return (
    <div>
      <button
        className={className}
        onClick={handleClick}
        disabled={disabled || isPending}
      >
        {isPending ? loadingText : children}
      </button>
      {error && (
        <div className="error" style={{ marginTop: '8px', color: 'red' }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}
