/**
 * Account information display component
 * @module components/AccountInfo
 */

import { useAccount } from '../hooks/useAccount.js';

/**
 * Props for AccountInfo component
 */
export interface AccountInfoProps {
  /** Blockchain address to display */
  address: string;
  /** RPC endpoint URL */
  rpcUrl?: string;
  /** Optional CSS class name */
  className?: string;
  /** Show loading state */
  showLoading?: boolean;
  /** Show error messages */
  showError?: boolean;
}

/**
 * Component that displays blockchain account information.
 *
 * Fetches and displays account details including address, account number, and sequence.
 *
 * @example
 * ```tsx
 * import { AccountInfo } from '@sonr.io/react';
 *
 * function MyComponent() {
 *   return (
 *     <AccountInfo
 *       address="sonr1abcdef..."
 *       className="account-card"
 *       showLoading={true}
 *       showError={true}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling
 * function StyledAccountInfo({ address }: { address: string }) {
 *   return (
 *     <div className="border rounded-lg p-4">
 *       <AccountInfo
 *         address={address}
 *         className="text-sm"
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function AccountInfo({
  address,
  rpcUrl,
  className = '',
  showLoading = true,
  showError = true,
}: AccountInfoProps) {
  const { data: account, isLoading, error } = useAccount({ address, rpcUrl });

  if (isLoading && showLoading) {
    return <div className={className}>Loading account information...</div>;
  }

  if (error && showError) {
    return (
      <div className={`${className} error`}>
        Error loading account: {error.message}
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <div className={className}>
      <div>
        <strong>Address:</strong> {account.address}
      </div>
      {account.accountNumber && (
        <div>
          <strong>Account Number:</strong> {account.accountNumber}
        </div>
      )}
      {account.sequence && (
        <div>
          <strong>Sequence:</strong> {account.sequence}
        </div>
      )}
      {account.pubKey && (
        <div>
          <strong>Public Key:</strong> {account.pubKey.slice(0, 16)}...
        </div>
      )}
    </div>
  );
}
