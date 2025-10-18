# @sonr.io/react

Modern React hooks for Sonr blockchain wallet and vault operations.

A comprehensive React hooks library providing seamless integration with the Sonr ecosystem, including vault management, wallet operations, WebAuthn authentication, and transaction handling.

## Features

- 🔐 **Vault Management** - WASM-based cryptographic operations with IndexedDB persistence
- 💼 **Wallet Connection** - Account management and balance queries
- 🔑 **WebAuthn Authentication** - Passwordless authentication with platform authenticators
- 📝 **Transaction Handling** - Sign and broadcast transactions with ease
- 🎫 **UCAN Token Management** - Create and manage UCAN authorization tokens
- 💾 **State Persistence** - Automatic state persistence with IndexedDB
- 🎨 **TypeScript Support** - Fully typed API with comprehensive type definitions
- ⚡ **Context Providers** - Global state management with React Context

## Installation

```bash
# Using bun (recommended)
bun add @sonr.io/react

# Using npm
npm install @sonr.io/react

# Using pnpm
pnpm add @sonr.io/react

# Using yarn
yarn add @sonr.io/react
```

## Quick Start

### 1. Wrap your app with providers

```tsx
import { VaultProvider, WalletProvider } from '@sonr.io/react';

function App() {
  return (
    <VaultProvider
      config={{
        wasmPath: '/vault.wasm',
        enablePersistence: true,
        autoInitialize: true,
      }}
    >
      <WalletProvider config={{ autoConnect: true }}>
        <YourApp />
      </WalletProvider>
    </VaultProvider>
  );
}
```

### 2. Use hooks in your components

```tsx
import { useWallet, useVaultClient, useAuth } from '@sonr.io/react';

function WalletButton() {
  const { connect, disconnect, isConnected, account } = useWallet();
  const { newOriginToken, isLoading } = useVaultClient();
  const { login, logout, isAuthenticated } = useAuth();

  if (isAuthenticated && account) {
    return (
      <div>
        <p>Connected: {account.address}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <button onClick={() => login()}>
      Login with WebAuthn
    </button>
  );
}
```

## Core Concepts

### Providers

Providers wrap your application and provide access to shared state.

#### VaultProvider

Manages the vault client lifecycle and provides access to cryptographic operations.

```tsx
<VaultProvider
  config={{
    wasmPath: '/vault.wasm',
    enablePersistence: true,
    autoInitialize: true,
    chainId: 'sonr-testnet-1',
  }}
>
  {children}
</VaultProvider>
```

#### WalletProvider

Manages wallet connection state and account information.

```tsx
<WalletProvider config={{ chainId: 'sonr-testnet-1', autoConnect: true }}>
  {children}
</WalletProvider>
```

## API Reference

### Vault Hooks

#### useVault

Access vault state and initialization.

```tsx
const { isReady, isInitialized, accountAddress, initialize, cleanup } = useVault();

// Initialize vault
await initialize('/vault.wasm', 'sonr1abc...');
```

#### useVaultClient

Perform cryptographic operations with the vault.

```tsx
const { newOriginToken, signData, verifyData, getIssuerDID, isLoading } = useVaultClient();

// Create UCAN token
const token = await newOriginToken({
  audience_did: 'did:sonr:user123',
  expires_at: Date.now() + 3600000, // 1 hour
});

// Sign data
const signature = await signData({
  data: new Uint8Array([1, 2, 3]),
});
```

#### useVaultStorage

Manage vault state persistence.

```tsx
const { state, persist, clear, isLoading } = useVaultStorage();

// Persist current state
await persist();

// Clear all stored data
await clear();
```

#### useUCANTokens

Manage UCAN tokens.

```tsx
const { tokens, removeExpired, isLoading, refetch } = useUCANTokens();

// Remove expired tokens
await removeExpired();

// Refresh token list
await refetch();
```

#### useAccountSwitch

Switch between multiple accounts.

```tsx
const { currentAccount, accounts, switchAccount, removeAccount, isLoading } = useAccountSwitch();

// Switch to different account
await switchAccount('sonr1xyz...');

// Remove an account
await removeAccount('sonr1abc...');
```

### Wallet Hooks

#### useWallet

Manage wallet connection.

```tsx
const { connect, disconnect, isConnected, isConnecting, account, balances, error } = useWallet();

// Connect wallet
await connect();

// Disconnect wallet
await disconnect();
```

#### useAccount

Access account information.

```tsx
const { account, address, publicKey, isConnected, setAccount } = useAccount();

if (isConnected && account) {
  console.log('Address:', address);
  console.log('Algorithm:', account.algo);
}
```

#### useBalance

Query account balances.

```tsx
const { data: balances, isLoading, refetch } = useBalance();

// Display balances
balances?.map((balance) => (
  <div key={balance.denom}>
    {balance.amount} {balance.denom}
  </div>
));

// Refresh balances
await refetch();
```

### Authentication Hooks

#### useWebAuthn

WebAuthn registration and authentication.

```tsx
const { register, authenticate, isLoading, error } = useWebAuthn();

// Register new credential
const credential = await register({
  username: 'user@example.com',
  displayName: 'Example User',
  timeout: 60000,
});

// Authenticate with existing credential
const authCredential = await authenticate({
  timeout: 60000,
});
```

#### useAuth

High-level authentication management.

```tsx
const { isAuthenticated, login, logout, registerWebAuthn, status, account, error } = useAuth();

// Register new user
await registerWebAuthn({
  username: 'user@example.com',
  displayName: 'Example User',
});

// Login existing user
await login();

// Logout
await logout();
```

### Transaction Hooks

#### useSignData

Sign data with the vault.

```tsx
const { mutate: sign, data, isLoading, isSuccess, error, reset } = useSignData();

// Sign message
const message = new TextEncoder().encode('Hello, Sonr!');
const signature = await sign({ data: message });

// Reset state
reset();
```

#### useBroadcastTx

Broadcast transactions to the blockchain.

```tsx
const { mutate: broadcast, data, isLoading, isSuccess, error } = useBroadcastTx();

// Broadcast transaction
const result = await broadcast({
  txBytes: new Uint8Array([...]),
  mode: 'sync', // 'sync' | 'async' | 'block'
});

console.log('Transaction hash:', result.txHash);
```

#### useTransaction

Combined signing and broadcasting.

```tsx
const { sign, broadcast, signData, broadcastData, isLoading, error, reset } = useTransaction();

// Sign and broadcast in sequence
const message = new TextEncoder().encode('Transaction data');
const signResult = await sign({ data: message });

const txBytes = new Uint8Array([...]); // Build tx with signature
const broadcastResult = await broadcast({ txBytes });

console.log('Transaction hash:', broadcastResult.txHash);
```

## Advanced Usage

### Custom Vault Client

```tsx
import { createVaultClient } from '@sonr.io/enclave';
import { VaultProvider } from '@sonr.io/react';

const customClient = createVaultClient({
  enablePersistence: true,
  chainId: 'sonr-mainnet-1',
});

await customClient.initialize('/vault.wasm', accountAddress);

function App() {
  return (
    <VaultProvider client={customClient}>
      {children}
    </VaultProvider>
  );
}
```

### Multiple Account Management

```tsx
function AccountSwitcher() {
  const { currentAccount, accounts, switchAccount, isLoading } = useAccountSwitch();

  return (
    <select
      value={currentAccount || ''}
      onChange={(e) => switchAccount(e.target.value)}
      disabled={isLoading}
    >
      {accounts.map((address) => (
        <option key={address} value={address}>
          {address}
        </option>
      ))}
    </select>
  );
}
```

### Token Management

```tsx
function TokenManager() {
  const { tokens, removeExpired, isLoading } = useUCANTokens();
  const { newOriginToken } = useVaultClient();

  const createToken = async () => {
    await newOriginToken({
      audience_did: 'did:sonr:recipient',
      expires_at: Date.now() + 86400000, // 24 hours
    });
  };

  return (
    <div>
      <h3>UCAN Tokens ({tokens.length})</h3>
      {tokens.map((token) => (
        <div key={token.id}>
          <p>Issuer: {token.issuer}</p>
          <p>Audience: {token.audience}</p>
        </div>
      ))}
      <button onClick={createToken}>Create Token</button>
      <button onClick={removeExpired} disabled={isLoading}>
        Remove Expired
      </button>
    </div>
  );
}
```

## TypeScript Support

All hooks and providers are fully typed with comprehensive TypeScript definitions.

```tsx
import type {
  Account,
  Balance,
  VaultState,
  WalletState,
  AuthState,
  UseVaultResult,
  UseWalletResult,
  UseAuthResult,
} from '@sonr.io/react';
```

## Testing

The package includes comprehensive test utilities for testing your components.

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { VaultProvider, useVault } from '@sonr.io/react';

describe('useVault', () => {
  it('should initialize vault', async () => {
    const { result } = renderHook(() => useVault(), {
      wrapper: ({ children }) => (
        <VaultProvider config={{ enablePersistence: false }}>
          {children}
        </VaultProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });
  });
});
```

## Dependencies

- `@sonr.io/enclave` - Low-level vault operations
- `@sonr.io/sdk` - Blockchain SDK
- `@tanstack/react-query` - Data fetching and caching
- `react` >= 18.2.0
- `react-dom` >= 18.2.0

## Development

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Run tests
bun test

# Run tests in watch mode
bun test:watch

# Type checking
bun run typecheck

# Linting
bun run lint
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT © Sonr Labs

## Links

- [Documentation](https://docs.sonr.io)
- [GitHub](https://github.com/sonr-io/motr)
- [Website](https://sonr.io)

## Support

For support, please join our [Discord](https://discord.gg/sonr) or open an issue on GitHub.
