# COSMES SDK Development Guidelines

## Build/Lint/Test Commands
- Build: `pnpm build`
- Watch mode: `pnpm dev`
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Run all tests: `pnpm test`
- Run single test: `pnpm vitest /path/to/test.test.ts`
- Run full test suite: `pnpm test:suite`
- Generate protobufs: `pnpm gen:protobufs`
- Generate registry: `pnpm gen:registry`

## Code Style Guidelines
- Use double quotes for strings
- Use semicolons
- Maximum line length: 80 characters
- Trailing commas in objects and arrays
- Always use parentheses for arrow function parameters
- Use TypeScript with strict type checking
- Prefix unused variables with underscore
- Organize exports in index.ts files for public API
- Follow ESModule patterns with explicit imports/exports
- Use named exports rather than default exports
- File naming: camelCase for utils, PascalCase for classes/types
- Error handling: use explicit types for errors and provide helpful messages