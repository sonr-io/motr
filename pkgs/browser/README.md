# @sonr.io/browser

Browser-optimized utilities for WebAuthn, storage, crypto operations, and Web Workers. Framework-agnostic and works with React, Vue, Svelte, or vanilla JavaScript.

## Installation

```bash
bun add @sonr.io/browser
```

## Usage

### WebAuthn

```typescript
import { registerWithPasskey, loginWithPasskey } from '@sonr.io/browser/webauthn';

// Register new passkey
const credential = await registerWithPasskey({
  username: 'user@example.com',
  displayName: 'User Name',
});

// Login with passkey
const assertion = await loginWithPasskey();
```

### Storage

```typescript
import { createVault } from '@sonr.io/browser/storage';

const vault = createVault('my-vault');
await vault.set('key', { data: 'value' });
const data = await vault.get('key');
```

### Crypto

```typescript
import { hash, randomBytes } from '@sonr.io/browser/crypto';

const data = new TextEncoder().encode('hello world');
const hashed = await hash(data, 'SHA-256');
const random = randomBytes(32);
```

## Browser Support

- Chrome/Edge 90+
- Firefox 87+
- Safari 14+

## Documentation

Full documentation coming soon.

## License

MIT
