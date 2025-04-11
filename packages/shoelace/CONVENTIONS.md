# CLAUDE.md - Guide for Agentic Coding

## Build & Test Commands
- Build: `npm run build` or `pnpm run build`
- Start dev server: `npm start` or `pnpm start`
- Lint: `npm run lint` or `pnpm run lint`
- Lint & fix: `npm run lint:fix` or `pnpm run lint:fix`
- Test all: `npm run test` or `pnpm run test`
- Test single component: `npm run test -- --group component-name` (e.g., `npm run test -- --group button`)
- Test watch mode: `npm run test:watch` or `pnpm run test:watch`
- Format with Prettier: `npm run prettier` or `pnpm run prettier`

## Code Style Guidelines
- TypeScript with strict types, avoid non-null assertions when possible
- ES Modules with named exports, avoid default exports 
- Imports sorted with `sort-imports-es6-autofix` plugin
- Web Components using Lit, following WC best practices
- Formatting: 2 spaces, 120 max line length, single quotes, no trailing commas
- Naming: kebab-case for components, camelCase for properties/methods
- Component structure: one component per directory with .ts, .styles.ts, .test.ts files
- Error handling: prefer TypeScript's strict handling, avoid throwing literals
- Avoid modifying native prototypes or using var/let when const is appropriate
