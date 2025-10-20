import { useEnclave, useEnclaveClient } from '@sonr.io/react';
import {
  Alert,
  AlertDescription,
  Badge,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
  Separator,
} from '@sonr.io/ui';

/**
 * Status indicator badge component
 */
function StatusBadge({ isReady, label }: { isReady: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <Badge variant={isReady ? 'default' : 'secondary'}>{isReady ? 'Ready' : 'Not Ready'}</Badge>
    </div>
  );
}

/**
 * Component to display enclave status and diagnostic information
 *
 * This component uses @sonr.io/react hooks to monitor the state of the
 * cryptographic enclave, showing initialization status, account address,
 * and available operations.
 */
export function EnclaveStatusCheck() {
  const { isReady, isInitialized, accountAddress, error, initialize, cleanup } = useEnclave();

  const { newOriginToken, signData, verifyData, getIssuerDID } = useEnclaveClient();

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Enclave Status</GlassCardTitle>
        <GlassCardDescription>
          Monitor your cryptographic enclave and vault operations
        </GlassCardDescription>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Indicators */}
        <div className="space-y-1">
          <StatusBadge isReady={isReady} label="Enclave Ready" />
          <StatusBadge isReady={isInitialized} label="Vault Initialized" />
          <StatusBadge isReady={!!accountAddress} label="Account Connected" />
        </div>

        <Separator />

        {/* Account Address */}
        {accountAddress && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Account Address
            </h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                {accountAddress}
              </code>
            </div>
          </div>
        )}

        {/* Available Operations */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Available Operations
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <OperationStatus
              label="Create UCAN Token"
              available={isReady && typeof newOriginToken === 'function'}
            />
            <OperationStatus
              label="Sign Data"
              available={isReady && typeof signData === 'function'}
            />
            <OperationStatus
              label="Verify Data"
              available={isReady && typeof verifyData === 'function'}
            />
            <OperationStatus
              label="Get Issuer DID"
              available={isReady && typeof getIssuerDID === 'function'}
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => initialize()}
            disabled={isInitialized}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Initialize
          </button>
          <button
            onClick={() => cleanup()}
            disabled={!isInitialized}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cleanup
          </button>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by @sonr.io/react v0.0.1
          </p>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

/**
 * Operation status indicator
 */
function OperationStatus({ label, available }: { label: string; available: boolean }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
      <div
        className={`w-2 h-2 rounded-full ${
          available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      />
      <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
}
