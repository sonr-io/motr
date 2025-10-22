import { useState } from 'react';
import { Button } from '@sonr.io/ui';

/**
 * IdentityManager Component
 *
 * Demonstrates using SonrIdentityDurable from @pkgs/cloudflare
 * which wraps @libs/enclave for persistent identity management
 */
export function IdentityManager() {
  const [accountAddress, setAccountAddress] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [did, setDid] = useState('');
  const [signature, setSignature] = useState('');

  /**
   * Initialize identity with SonrIdentityDurable
   * Uses Cloudflare Durable Objects for persistent state
   */
  const handleInitialize = async () => {
    if (!accountAddress) {
      setMessage('Please enter an account address');
      return;
    }

    setStatus('loading');
    setMessage('Initializing identity...');

    try {
      const response = await fetch(`/api/identity/${accountAddress}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasmPath: '/enclave.wasm',
          accountAddress
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Initialization failed');
      }

      const data = await response.json();
      setStatus('success');
      setMessage(`Identity initialized successfully for ${data.accountAddress}`);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to initialize');
    }
  };

  /**
   * Get DID from initialized identity
   */
  const handleGetDID = async () => {
    if (!accountAddress) {
      setMessage('Please initialize first');
      return;
    }

    setStatus('loading');
    setMessage('Fetching DID...');

    try {
      const response = await fetch(`/api/identity/${accountAddress}/did`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get DID');
      }

      const data = await response.json();
      setDid(data.issuer_did);
      setStatus('success');
      setMessage('DID retrieved successfully');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to get DID');
    }
  };

  /**
   * Sign data using the identity
   */
  const handleSignData = async () => {
    if (!accountAddress) {
      setMessage('Please initialize first');
      return;
    }

    setStatus('loading');
    setMessage('Signing data...');

    try {
      const message = 'Hello from SonrIdentityDurable!';
      const data = Array.from(new TextEncoder().encode(message));

      const response = await fetch(`/api/identity/${accountAddress}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sign data');
      }

      const result = await response.json();
      setSignature(
        result.signature
          .slice(0, 32)
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('') + '...'
      );
      setStatus('success');
      setMessage('Data signed successfully');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to sign data');
    }
  };

  /**
   * Check identity status
   */
  const handleCheckStatus = async () => {
    if (!accountAddress) {
      setMessage('Please enter an account address');
      return;
    }

    setStatus('loading');
    setMessage('Checking status...');

    try {
      const response = await fetch(`/api/identity/${accountAddress}/status`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check status');
      }

      const data = await response.json();
      setStatus('success');
      setMessage(
        `Status: ${data.isInitialized ? 'Initialized' : 'Not initialized'}\n` +
        `Account: ${data.accountAddress || 'None'}\n` +
        `Connected Sessions: ${data.connectedSessions}`
      );
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to check status');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Sonr Identity Manager</h2>
        <p className="text-sm text-muted-foreground">
          Powered by SonrIdentityDurable from @pkgs/cloudflare wrapping @libs/enclave
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Address Input */}
        <div className="space-y-2">
          <label htmlFor="account" className="text-sm font-medium">
            Account Address
          </label>
          <input
            id="account"
            type="text"
            value={accountAddress}
            onChange={(e) => setAccountAddress(e.target.value)}
            placeholder="sonr1..."
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleInitialize}
            disabled={status === 'loading'}
            variant="default"
          >
            Initialize Identity
          </Button>

          <Button
            onClick={handleCheckStatus}
            disabled={status === 'loading'}
            variant="outline"
          >
            Check Status
          </Button>

          <Button
            onClick={handleGetDID}
            disabled={status === 'loading'}
            variant="outline"
          >
            Get DID
          </Button>

          <Button
            onClick={handleSignData}
            disabled={status === 'loading'}
            variant="outline"
          >
            Sign Data
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-md whitespace-pre-wrap ${
              status === 'error'
                ? 'bg-red-50 text-red-900 border border-red-200'
                : status === 'success'
                ? 'bg-green-50 text-green-900 border border-green-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Results Display */}
        {did && (
          <div className="p-4 bg-gray-50 rounded-md border space-y-2">
            <div className="text-sm font-medium">DID:</div>
            <div className="font-mono text-xs break-all">{did}</div>
          </div>
        )}

        {signature && (
          <div className="p-4 bg-gray-50 rounded-md border space-y-2">
            <div className="text-sm font-medium">Signature (first 32 bytes):</div>
            <div className="font-mono text-xs break-all">{signature}</div>
          </div>
        )}
      </div>

      {/* Architecture Info */}
      <div className="p-4 bg-blue-50 rounded-md border border-blue-200 space-y-2">
        <div className="text-sm font-medium text-blue-900">Architecture</div>
        <div className="text-xs text-blue-800 space-y-1">
          <div>📦 Component → Cloudflare Worker</div>
          <div>🔄 Worker → SonrIdentityDurable (Durable Object)</div>
          <div>🔐 SonrIdentityDurable → EnclaveWorkerClient (@libs/enclave)</div>
          <div>⚡ EnclaveWorkerClient → Web Worker → WASM</div>
          <div>💾 State persisted globally via Cloudflare</div>
        </div>
      </div>
    </div>
  );
}
