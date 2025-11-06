# @sonr.io/web

SvelteKit application for Sonr with Konsta UI components.

## Development

```bash
# Start development server (http://localhost:5173)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Type checking
bun run typecheck

# Linting
bun run lint

# Format code
bun run format
```

## Architecture

- **Framework**: SvelteKit with Svelte 5 (runes-based reactivity)
- **UI Library**: Konsta UI v5 (Material Design theme)
- **Styling**: Tailwind CSS v4
- **Adapter**: @sveltejs/adapter-cloudflare for Cloudflare Pages
- **Package Manager**: Bun

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PUBLIC_API_URL=http://localhost:5165/api
PUBLIC_ENV=development
```

## Project Structure

```
apps/web/
├── src/
│   ├── routes/          # SvelteKit routes (file-based routing)
│   │   ├── +layout.svelte   # Root layout with Konsta App wrapper
│   │   └── +page.svelte     # Home page
│   ├── lib/             # Shared utilities and components
│   ├── app.html         # HTML template
│   └── app.css          # Global styles (Tailwind directives)
├── static/              # Static assets
├── svelte.config.js     # SvelteKit configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind + Konsta configuration
└── package.json
```

## Dependencies

### Workspace Dependencies
- `@sonr.io/sdk` - Sonr SDK for blockchain interactions
- `@sonr.io/ui` - Konsta UI component library

### External Dependencies
- `konsta` - Konsta UI framework
- `svelte` - Svelte 5 framework
- `@sveltejs/kit` - SvelteKit framework
- `tailwindcss` - Tailwind CSS v4
- `@tailwindcss/postcss` - Tailwind PostCSS plugin

## Hot Module Replacement (HMR)

Vite provides instant HMR for Svelte components. Any changes to:
- `.svelte` files
- `.ts` files
- `.css` files

Will trigger automatic browser updates without full page reload.

## Building

The build process:
1. Vite builds the SvelteKit app
2. TypeScript compiles and type-checks
3. Cloudflare adapter generates static assets
4. Output is written to `.svelte-kit/cloudflare/`

## Deployment

This app is deployed to Cloudflare Pages:

```bash
# Deploy to staging
bun run deploy:staging

# Deploy to production
bun run deploy:production
```

The Cloudflare adapter automatically handles:
- Static asset optimization
- Server-side rendering (SSR) functions
- Edge deployment configuration
