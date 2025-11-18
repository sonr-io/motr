# Sonr Frontend

A minimal vanilla TanStack Query application demonstrating integration with `@sonr.io/sdk` and `@sonr.io/ui` packages.

## Features

- **@sonr.io/sdk** - Blockchain client with RPC APIs, wallet support, and passkey authentication
- **@sonr.io/ui** - Comprehensive UI component library built on Radix UI and Tailwind CSS
- **TanStack Query** - Powerful data fetching with caching, background updates, and devtools
- **TanStack Router** - Type-safe routing with automatic code splitting
- **Vite** - Lightning-fast development server and build tool
- **TypeScript** - Full type safety throughout the application

## Project Structure

```
apps/frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── AccountInfo.tsx
│   │   └── BalanceInfo.tsx
│   ├── queries/        # TanStack Query hooks
│   │   ├── useAccountQuery.ts
│   │   ├── useBalanceQuery.ts
│   │   └── useTxQuery.ts
│   ├── lib/            # Utility functions and clients
│   │   └── client.ts
│   ├── routes/         # File-based routing
│   │   ├── __root.tsx
│   │   └── index.tsx
│   └── main.tsx        # Application entry point
├── package.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Build required packages
pnpm build:es
pnpm build:ui
```

### Development

```bash
# Start the development server
cd apps/frontend
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Building

```bash
# Build for production
pnpm build
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the RPC endpoint:

```env
# Testnet (default)
VITE_RPC_URL=https://rpc.testnet.sonr.io

# Mainnet
# VITE_RPC_URL=https://rpc.mainnet.sonr.io

# Local development
# VITE_RPC_URL=http://localhost:26657
```

## Usage Examples

### Custom Query Hooks

The app includes reusable TanStack Query hooks for common blockchain operations:

```typescript
import { useAccountQuery, useBalanceQuery, useTxQuery } from './queries'
import { rpcClient } from './lib/client'

// Query account information
const { data, isLoading, error } = useAccountQuery({
  address: 'sonr1...',
  rpcClient,
})

// Query balances with auto-refresh
const { data: balances } = useBalanceQuery({
  address: 'sonr1...',
  rpcClient,
})

// Query transaction by hash
const { data: tx } = useTxQuery({
  hash: 'ABC123...',
  rpcClient,
})
```

### Using @sonr.io/ui Components

```typescript
import { Button, Card, CardHeader, CardTitle, CardContent } from '@sonr.io/ui'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => console.log('Clicked')}>
          Click Me
        </Button>
      </CardContent>
    </Card>
  )
}
```

## Query Features Demonstrated

- ✅ Custom query hooks with proper TypeScript types
- ✅ Automatic caching and stale-time configuration
- ✅ Background refetching for real-time data
- ✅ Error handling and loading states
- ✅ Manual refetch capabilities
- ✅ React Query Devtools integration
- ✅ Router Devtools integration

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code
- `pnpm check` - Check code quality

## Learn More

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [Vite Documentation](https://vitejs.dev)
- [Sonr Documentation](https://docs.sonr.io)
