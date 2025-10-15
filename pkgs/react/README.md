# @sonr.io/react

React hooks and components for Sonr blockchain integration with TanStack Query.

## Installation

```bash
bun add @sonr.io/react @sonr.io/sdk
```

## Usage

```tsx
import { SonrProvider, useAccount, useBalance } from '@sonr.io/react';

function App() {
  return (
    <SonrProvider
      config={{
        rpcUrl: 'https://rpc.testnet.sonr.io',
        chainId: 'sonr-testnet-1',
        network: 'testnet',
      }}
    >
      <YourApp />
    </SonrProvider>
  );
}

function YourComponent() {
  const { data: account } = useAccount({ address: 'sonr1...' });
  const { data: balance } = useBalance({ address: 'sonr1...' });

  return (
    <div>
      <p>Account: {account?.address}</p>
      <p>Balance: {balance?.amount}</p>
    </div>
  );
}
```

## Documentation

Full documentation coming soon.

## License

MIT
