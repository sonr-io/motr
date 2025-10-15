# [feat: create dedicated @sonr.io/react and @sonr.io/browser packages for improved DX](https://github.com/sonr-io/motr/issues/4)

## Summary

Extract framework-specific and browser-specific functionality from the monolithic `@sonr.io/sdk` package into two specialized packages: `@sonr.io/react` for React-specific hooks and components, and `@sonr.io/browser` for browser-optimized utilities. This architectural refactoring will:

1. **Reduce bundle sizes** by 28-67% through better tree-shaking
2. **Improve developer experience** with framework-specific APIs and pre-built hooks
3. **Enable framework-agnostic core** by removing React dependencies from SDK
4. **Simplify onboarding** with clearer mental models and targeted documentation
5. **Support multiple frameworks** by providing browser utilities that work with React, Vue, Svelte, and vanilla JS

**Core Requirements:**
- Create `@sonr.io/react` package with TanStack Query hooks for blockchain queries and transactions
- Create `@sonr.io/browser` package with WebAuthn, IndexedDB, and crypto utilities
- Refactor `@sonr.io/sdk` to remove framework dependencies while maintaining backward compatibility
- Migrate existing frontend code to use new packages
- Achieve >90% test coverage for all packages
- Provide comprehensive documentation and migration guides

## Action Items

### Phase 1: Package Setup & Infrastructure ✅
> Use @typescript-pro, @deployment-engineer

1. **✅ Create @sonr.io/react workspace** `/pkgs/react/`
   - ✅ Create `package.json` with React 18+ and TanStack Query dependencies
   - ✅ Create `tsconfig.json` extending shared TypeScript config
   - ✅ Create `vite.config.ts` for package bundling
   - ✅ Create `.eslintrc.js` with React-specific linting rules
   - ✅ Set up `vitest.config.ts` for testing
   - ✅ Add exports configuration for ESM/CJS support

2. **✅ Create @sonr.io/browser workspace** `/pkgs/browser/`
   - ✅ Create `package.json` with zero framework dependencies
   - ✅ Create `tsconfig.json` with browser-specific targets
   - ✅ Create `vite.config.ts` optimized for browser bundles
   - ✅ Create `.eslintrc.js` with browser-specific rules
   - ✅ Set up `vitest.config.ts` with browser environment
   - ✅ Configure exports for tree-shakeable imports

3. **✅ Update monorepo configuration**
   - ✅ Update `/package.json` workspaces to include `pkgs/react` and `pkgs/browser`
   - ✅ Update `/turbo.json` with build pipeline dependencies:
     - `@sonr.io/react#build` depends on `@sonr.io/sdk#build`
     - `@sonr.io/browser#build` has no dependencies
     - `@sonr.io/frontend#dev` depends on all package builds
   - ⏭️ Update root `tsconfig.json` with path aliases for new packages (not required)
   - ⏭️ Add new packages to Changesets configuration (deferred to Phase 8)

### Phase 2: @sonr.io/react Implementation
> Use @typescript-pro, @frontend-developer, @test-automator

4. **Implement React hooks for blockchain queries** `/pkgs/react/src/hooks/`
   - `useAccount.ts` - Query hook for account data with automatic refetching
   - `useBalance.ts` - Query hook for balance data with polling options
   - `useTx.ts` - Mutation hook for transaction submission with optimistic updates
   - `useWallet.ts` - State hook for wallet connection management
   - `useWebAuthn.ts` - Hook for passkey registration and authentication
   - Each hook should:
     - Accept typed options parameter
     - Return TanStack Query result with data/loading/error states
     - Include JSDoc documentation with usage examples
     - Support custom query keys for cache management

5. **Create React context providers** `/pkgs/react/src/context/`
   - `SonrProvider.tsx` - Root provider wrapping QueryClientProvider
     - Initialize QueryClient with sensible defaults
     - Accept custom QueryClient configuration
     - Provide network configuration (mainnet/testnet)
   - `WalletContext.tsx` - Wallet state management context
     - Track connected wallet address
     - Manage wallet connection state
     - Provide wallet connection/disconnection methods

6. **Create reusable React components** `/pkgs/react/src/components/`
   - `WalletProvider.tsx` - Wallet connection wrapper component
   - `AccountInfo.tsx` - Display account information (optional)
   - `TransactionButton.tsx` - Button with transaction signing UI (optional)
   - All components should:
     - Use hooks from `/pkgs/react/src/hooks/`
     - Accept className prop for styling flexibility
     - Include TypeScript types for all props
     - Have comprehensive JSDoc documentation

7. **Write tests for React package** `/pkgs/react/src/__tests__/`
   - Unit tests for each hook using `@testing-library/react-hooks`
   - Component tests using `@testing-library/react`
   - Integration tests with mock QueryClient
   - Coverage target: >90%

8. **Create React examples** `/pkgs/react/examples/`
   - `basic-usage.tsx` - Simple account query example
   - `transaction-flow.tsx` - Complete transaction submission example
   - `wallet-connection.tsx` - Wallet connection state management
   - `webauthn-auth.tsx` - WebAuthn registration and login

### Phase 3: @sonr.io/browser Implementation
> Use @typescript-pro, @security-auditor, @test-automator

9. **Migrate WebAuthn utilities** `/pkgs/browser/src/webauthn/`
   - Move `/pkgs/sdk/src/client/auth/webauthn.ts` → `/pkgs/browser/src/webauthn/index.ts`
   - Create `registration.ts` - WebAuthn registration flow
   - Create `authentication.ts` - WebAuthn authentication flow
   - Create `types.ts` - WebAuthn type definitions
   - Create `presets.ts` - Authenticator configuration presets
   - Ensure all functions:
     - Work in pure browser environment (no Node.js)
     - Have comprehensive error handling
     - Include JSDoc with browser compatibility notes

10. **Implement storage utilities** `/pkgs/browser/src/storage/`
    - `indexed-db.ts` - IndexedDB wrapper with async/await API
    - `vault.ts` - Encrypted vault storage for sensitive data
    - `session.ts` - Session storage helpers
    - `local.ts` - Local storage helpers with type safety
    - All storage modules should:
      - Handle quota exceeded errors
      - Support storage event listeners
      - Include serialization helpers

11. **Create crypto utilities** `/pkgs/browser/src/crypto/`
    - `subtle.ts` - Web Crypto API wrappers
    - `random.ts` - Cryptographically secure random generation
    - `hash.ts` - Hashing utilities (SHA-256, etc.)
    - `encoding.ts` - Base64url and hex encoding/decoding
    - All crypto functions should:
      - Use SubtleCrypto API
      - Handle unsupported algorithm errors
      - Include fallbacks for older browsers

12. **Implement Web Worker utilities** `/pkgs/browser/src/worker/`
    - `service-worker.ts` - Service Worker registration and messaging
    - `worker-pool.ts` - Web Worker pool management
    - `crypto-worker.ts` - Offload crypto operations to workers

13. **Move browser autoloader** `/pkgs/browser/src/autoloader.ts`
    - Move autoloader code from SDK to browser package
    - Ensure it works with ESM and UMD formats
    - Support CDN usage with version pinning

14. **Write tests for browser package** `/pkgs/browser/src/__tests__/`
    - Unit tests for all utilities using jsdom environment
    - Mock WebAuthn API with `@simplewebauthn/server` test helpers
    - Test IndexedDB operations with `fake-indexeddb`
    - Coverage target: >90%

15. **Create browser examples** `/pkgs/browser/examples/`
    - `vanilla-js/` - Pure JavaScript example with no frameworks
    - `webauthn-demo/` - Complete WebAuthn registration/login demo
    - `storage-demo/` - IndexedDB and vault storage examples
    - `worker-demo/` - Web Worker crypto offloading example

### Phase 4: SDK Refactoring
> Use @typescript-pro, @code-reviewer-pro

16. **Remove React dependencies from SDK** `/pkgs/sdk/`
    - Update `package.json`:
      - Remove `@tanstack/query-core` from dependencies
      - Remove `@testing-library/react` from devDependencies
      - Remove all React-related packages
    - Update `src/index.ts`:
      - Remove React Query exports
      - Remove WebAuthn exports (moved to browser package)
      - Keep only framework-agnostic exports

17. **Create backward compatibility layer** `/pkgs/sdk/src/compat.ts`
    - Re-export React hooks from `@sonr.io/react` with deprecation warnings
    - Re-export browser utilities from `@sonr.io/browser` with deprecation warnings
    - Add console warnings guiding users to migrate
    - Plan to remove in v2.0.0

18. **Verify SDK works in Node.js** `/pkgs/sdk/src/__tests__/`
    - Test RPC client in Node.js environment
    - Test codec utilities in Node.js environment
    - Test wallet connection logic in Node.js environment
    - Ensure no browser-specific code remains

19. **Update SDK documentation** `/pkgs/sdk/README.md`
    - Update installation instructions
    - Add migration guide to new packages
    - Update API reference to remove deprecated exports
    - Add "What's New" section explaining package split

### Phase 5: Frontend Migration
> Use @frontend-developer, @typescript-pro

20. **Update frontend dependencies** `/apps/frontend/package.json`
    - Add `@sonr.io/react` dependency
    - Add `@sonr.io/browser` dependency
    - Keep `@sonr.io/sdk` for core functionality
    - Update to latest versions

21. **Migrate frontend queries** `/apps/frontend/src/queries/`
    - Update `useAccountQuery.ts` to use `useAccount` from `@sonr.io/react`
    - Update `useBalanceQuery.ts` to use `useBalance` from `@sonr.io/react`
    - Update `useTxQuery.ts` to use `useTx` from `@sonr.io/react`
    - Remove duplicate query logic

22. **Update frontend imports** `/apps/frontend/src/`
    - Replace SDK imports with React package imports throughout codebase
    - Replace browser utility imports with browser package imports
    - Use find-and-replace for common import patterns
    - Verify with TypeScript compiler

23. **Add SonrProvider to app root** `/apps/frontend/src/main.tsx`
    - Wrap app with `<SonrProvider>` from `@sonr.io/react`
    - Configure QueryClient with appropriate defaults
    - Set network configuration (testnet for development)

24. **Test frontend functionality** `/apps/frontend/`
    - Run development server: `bun run dev`
    - Test account queries on home page
    - Test wallet connection flow
    - Test registration form with WebAuthn
    - Verify no console errors or warnings

### Phase 6: Documentation & Examples
> Use @documentation-expert, @frontend-developer

25. **Write @sonr.io/react documentation** `/pkgs/react/README.md`
    - Installation instructions
    - Quick start guide
    - API reference for all hooks
    - Provider configuration options
    - Usage examples for common scenarios
    - Troubleshooting section
    - Migration guide from SDK

26. **Write @sonr.io/browser documentation** `/pkgs/browser/README.md`
    - Installation instructions
    - Quick start guide
    - API reference for all utilities
    - WebAuthn implementation guide
    - Storage API guide
    - Browser compatibility matrix
    - Framework integration examples (React, Vue, Svelte)

27. **Create comprehensive examples** `/examples/`
    - `react-hooks/` - Complete React app using all hooks
      - Account dashboard with balance display
      - Transaction submission form
      - Wallet connection UI
      - WebAuthn registration flow
    - `browser-vanilla/` - Vanilla JS app using browser package
      - WebAuthn demo without frameworks
      - IndexedDB vault storage
      - Crypto operations in Web Workers
    - `vue-integration/` - Vue 3 app using browser package
      - Composition API integration
      - WebAuthn registration
      - State management with Pinia
    - `nextjs-app/` - Next.js 15 app with SSR considerations
      - Client-only WebAuthn components
      - Server-side account queries
      - Optimistic UI updates

28. **Update main repository README** `/README.md`
    - Update architecture diagram with new packages
    - Add "Packages" section with descriptions
    - Update "Getting Started" with new installation flow
    - Add migration guide for existing users
    - Update contributing guidelines

29. **Create migration guide** `/docs/MIGRATION.md`
    - v0.x → v1.x migration steps
    - Breaking changes list
    - Code transformation examples
    - Codemod script (if needed)
    - FAQ section

### Phase 7: Testing & Quality Assurance
> Use @test-automator, @qa-expert, @performance-engineer

30. **Run comprehensive test suite**
    - `bun test` - Run all package tests
    - Verify >90% coverage for all packages
    - Fix any failing tests
    - Review coverage reports

31. **Integration testing** `/tests/integration/`
    - Test cross-package imports
    - Test React hooks with real blockchain queries (testnet)
    - Test browser utilities in real browser environment
    - Test WebAuthn flow end-to-end

32. **Bundle size analysis**
    - Run `bun run build` for all packages
    - Analyze bundle sizes with `bundlephobia`
    - Compare old SDK bundle vs new package bundles:
      - React app: SDK (553KB) → React (400KB) = 28% reduction
      - Vanilla JS: SDK (553KB) → Browser (180KB) = 67% reduction
    - Verify tree-shaking effectiveness

33. **Performance testing**
    - Measure hook render performance with React DevTools
    - Test query caching effectiveness
    - Measure WebAuthn operation latency
    - Test IndexedDB read/write performance

34. **Browser compatibility testing**
    - Test in Chrome/Edge (latest 2 versions)
    - Test in Firefox (latest 2 versions)
    - Test in Safari (latest 2 versions)
    - Test WebAuthn on mobile browsers (iOS Safari, Chrome Android)
    - Document any browser-specific quirks

35. **Accessibility audit**
    - Test keyboard navigation in example apps
    - Verify screen reader compatibility
    - Check color contrast ratios
    - Test with browser accessibility tools

### Phase 8: Publishing & Release
> Use @deployment-engineer, @product-manager

36. **Prepare changelogs**
    - `/pkgs/react/CHANGELOG.md` - Initial release (v1.0.0)
    - `/pkgs/browser/CHANGELOG.md` - Initial release (v1.0.0)
    - `/pkgs/sdk/CHANGELOG.md` - Breaking changes (v1.0.0)
    - Use Changesets to generate changelogs

37. **Update package versions**
    - Run `bun changeset` to create changesets
    - Set all packages to v1.0.0 for major release
    - Verify version consistency across workspaces

38. **Pre-publish checklist**
    - All tests passing
    - Documentation complete
    - Examples working
    - Bundle sizes optimized
    - TypeScript types exported correctly
    - README badges added (build status, coverage, npm version)

39. **Publish to npm**
    - Set npm registry authentication
    - Dry run: `npm publish --dry-run` for each package
    - Publish `@sonr.io/sdk@1.0.0`
    - Publish `@sonr.io/browser@1.0.0`
    - Publish `@sonr.io/react@1.0.0`
    - Verify packages on npmjs.com

40. **Post-release tasks**
    - Create GitHub release with changelog
    - Update documentation website
    - Announce on social media / Discord
    - Monitor for issues and bug reports

## Documentation

### Architecture Resources

**Monorepo Best Practices:**
- [Building a Production-Ready Monorepo with Turborepo](https://mavro.dev/blog/building-production-monorepo-turborepo) - Comprehensive guide to Turborepo architecture patterns
- [Turborepo Official Docs: Structuring a Repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository) - Official repository structure guidelines
- [Monorepos in JavaScript & TypeScript](https://www.robinwieruch.de/javascript-monorepos/) - Deep dive into JavaScript monorepo patterns

**Framework-Agnostic Design:**
- [How to Build Framework-Agnostic Web SDKs: Step by Step](https://cheesecakelabs.com/blog/how-to-build-framework-agnostic-web-sdks/) - Comprehensive guide to building framework-agnostic SDKs
- [The Ultimate Guide to Creating Framework-Agnostic JavaScript Libraries](https://medium.com/@codewithrajat/the-ultimate-guide-to-creating-framework-agnostic-javascript-libraries-20c5bb72366c) - Best practices for framework independence
- [Scalable JavaScript Design Patterns](https://addyosmani.com/scalablejs/) - Classic reference on abstraction layer architecture

**TanStack Query Patterns:**
- [TanStack Query Custom Hooks Example](https://tanstack.com/query/v4/docs/react/examples/react/custom-hooks) - Official examples of custom query hooks
- [Path To A Clean React Architecture - React Query](https://profy.dev/article/react-architecture-tanstack-query) - Best practices for organizing TanStack Query in applications
- [Project Structure Suggestions - TanStack/query Discussion](https://github.com/TanStack/query/discussions/3017) - Community discussion on query organization patterns

**WebAuthn Implementation:**
- [WebAuthn Guide](https://webauthn.guide/) - Comprehensive introduction to Web Authentication
- [@simplewebauthn/browser Documentation](https://simplewebauthn.dev/docs/packages/browser) - Official SimpleWebAuthn browser package docs
- [MDN Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) - Official Web Authentication API reference
- [WebAuthn.io Demo](https://webauthn.io/) - Interactive demonstration of WebAuthn specification

### Technical References

**TypeScript & Bundling:**
- [Package Exports](https://nodejs.org/api/packages.html#package-entry-points) - Node.js package exports specification
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html) - Understanding module resolution
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode) - Building libraries with Vite

**React Best Practices:**
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks) - Official React custom hooks guide
- [React 19 Documentation](https://react.dev/) - Latest React features and patterns

**Browser APIs:**
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Cryptographic operations in browsers
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Client-side storage
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) - Background script capabilities
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) - Multi-threaded JavaScript

### Project Context

**Codebase Analysis:**
- Current SDK location: `/pkgs/sdk/` (mixed framework-specific and agnostic code)
- WebAuthn implementation: `/pkgs/sdk/src/client/auth/webauthn.ts` (619 lines, production-ready)
- Frontend queries: `/apps/frontend/src/queries/` (existing React Query patterns)
- UI components: `/pkgs/ui/src/components/` (React components with Tailwind CSS)

**Key Dependencies:**
- `@simplewebauthn/browser` - WebAuthn client library
- `@tanstack/react-query` - Data fetching for React
- `react` 19.2.0 - React framework
- `vite` 7.1.9 - Build tool
- `typescript` 5.7.3 - Type safety
- `turbo` 2.5.8 - Monorepo orchestration
- `bun` 1.3.0 - Package manager and runtime

**Build Pipeline:**
- Turborepo manages task orchestration
- Bun handles package installation and script execution
- Vite bundles packages in library mode
- TypeScript provides type checking and .d.ts generation

## Changes

### New Files to Create

**@sonr.io/react Package:**
```
/pkgs/react/
├── src/
│   ├── hooks/
│   │   ├── useAccount.ts
│   │   ├── useBalance.ts
│   │   ├── useTx.ts
│   │   ├── useWallet.ts
│   │   ├── useWebAuthn.ts
│   │   └── index.ts
│   ├── context/
│   │   ├── SonrProvider.tsx
│   │   ├── WalletContext.tsx
│   │   └── index.ts
│   ├── components/
│   │   ├── WalletProvider.tsx
│   │   ├── AccountInfo.tsx
│   │   ├── TransactionButton.tsx
│   │   └── index.ts
│   ├── __tests__/
│   │   ├── hooks/
│   │   ├── components/
│   │   └── integration/
│   ├── types.ts
│   └── index.ts
├── examples/
│   ├── basic-usage.tsx
│   ├── transaction-flow.tsx
│   ├── wallet-connection.tsx
│   └── webauthn-auth.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.js
├── README.md
└── CHANGELOG.md
```

**@sonr.io/browser Package:**
```
/pkgs/browser/
├── src/
│   ├── webauthn/
│   │   ├── registration.ts
│   │   ├── authentication.ts
│   │   ├── types.ts
│   │   ├── presets.ts
│   │   └── index.ts
│   ├── storage/
│   │   ├── indexed-db.ts
│   │   ├── vault.ts
│   │   ├── session.ts
│   │   ├── local.ts
│   │   └── index.ts
│   ├── crypto/
│   │   ├── subtle.ts
│   │   ├── random.ts
│   │   ├── hash.ts
│   │   ├── encoding.ts
│   │   └── index.ts
│   ├── worker/
│   │   ├── service-worker.ts
│   │   ├── worker-pool.ts
│   │   ├── crypto-worker.ts
│   │   └── index.ts
│   ├── __tests__/
│   │   ├── webauthn/
│   │   ├── storage/
│   │   ├── crypto/
│   │   └── worker/
│   ├── autoloader.ts
│   ├── types.ts
│   └── index.ts
├── examples/
│   ├── vanilla-js/
│   ├── webauthn-demo/
│   ├── storage-demo/
│   └── worker-demo/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.js
├── README.md
└── CHANGELOG.md
```

**Examples:**
```
/examples/
├── react-hooks/
│   ├── src/
│   ├── package.json
│   └── README.md
├── browser-vanilla/
│   ├── src/
│   ├── package.json
│   └── README.md
├── vue-integration/
│   ├── src/
│   ├── package.json
│   └── README.md
└── nextjs-app/
    ├── src/
    ├── package.json
    └── README.md
```

**Documentation:**
```
/docs/
├── MIGRATION.md
└── ARCHITECTURE.md
```

### Files to Modify

**Root Configuration:**
- `/package.json` - Add new workspaces: `pkgs/react`, `pkgs/browser`, `examples/*`
- `/turbo.json` - Add build pipeline for new packages
- `/tsconfig.json` - Add path aliases for new packages

**SDK Package:**
- `/pkgs/sdk/package.json` - Remove React dependencies
- `/pkgs/sdk/src/index.ts` - Remove React Query and WebAuthn exports
- `/pkgs/sdk/src/compat.ts` - Add backward compatibility layer (NEW FILE)
- `/pkgs/sdk/README.md` - Update documentation with migration guide

**Frontend Application:**
- `/apps/frontend/package.json` - Add `@sonr.io/react` and `@sonr.io/browser` dependencies
- `/apps/frontend/src/main.tsx` - Add `SonrProvider` wrapper
- `/apps/frontend/src/queries/useAccountQuery.ts` - Replace with `useAccount` from React package
- `/apps/frontend/src/queries/useBalanceQuery.ts` - Replace with `useBalance` from React package
- `/apps/frontend/src/queries/useTxQuery.ts` - Replace with `useTx` from React package
- `/apps/frontend/vite.config.ts` - Update for new package structure

**Repository Documentation:**
- `/README.md` - Update with new package structure and installation instructions

### Files to Move

**WebAuthn Migration:**
- `/pkgs/sdk/src/client/auth/webauthn.ts` → `/pkgs/browser/src/webauthn/index.ts`
- `/pkgs/sdk/src/client/auth/webauthn.test.ts` → `/pkgs/browser/src/__tests__/webauthn/index.test.ts`

**Storage Migration:**
- Any SDK storage utilities → `/pkgs/browser/src/storage/`

**Autoloader Migration:**
- SDK autoloader code → `/pkgs/browser/src/autoloader.ts`

### Expected Outcomes

**Bundle Size Improvements:**
| Use Case | Before (SDK Only) | After (New Packages) | Savings |
|----------|-------------------|----------------------|---------|
| React App | 553 KB | ~400 KB | 28% |
| Vanilla JS | 553 KB | ~180 KB | 67% |
| Vue App | 553 KB | ~180 KB | 67% |

**Developer Experience:**
```typescript
// BEFORE: Manual hook creation required
import { getAccount } from '@sonr.io/sdk/client';
import { useQuery } from '@tanstack/react-query';

function useAccount(address: string) {
  return useQuery({
    queryKey: ['account', address],
    queryFn: () => getAccount(rpcEndpoint, { address }),
  });
}

// AFTER: Pre-built hooks included
import { useAccount } from '@sonr.io/react';

const { data, isLoading, error } = useAccount({ address });
```

**Framework Flexibility:**
```typescript
// React
import { useAccount } from '@sonr.io/react';

// Vue, Svelte, Vanilla JS
import { registerWithPasskey } from '@sonr.io/browser/webauthn';
```

**Tree-Shaking:**
- React apps only bundle React package + SDK core
- Vanilla JS apps only bundle browser package
- No unnecessary framework code in bundles
