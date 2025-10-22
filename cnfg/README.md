# @pkgs/config

Shared configuration files for the Sonr monorepo. This package provides standardized configurations for TypeScript, Vite, Tailwind CSS, and linting across all packages and applications.

## Installation

This package is automatically available in the monorepo via workspace protocol:

```json
{
  "devDependencies": {
    "@pkgs/config": "workspace:*"
  }
}
```

## Usage

### TypeScript

Choose the appropriate config based on your project type:

#### React Applications (apps/*)

```json
{
  "extends": "@pkgs/config/typescript/react-app"
}
```

#### React Libraries (libs/react, pkgs/ui, etc.)

```json
{
  "extends": "@pkgs/config/typescript/react-library"
}
```

#### Node/Library Packages

```json
{
  "extends": "@pkgs/config/typescript/library"
}
```

#### Cloudflare Workers

```json
{
  "extends": "@pkgs/config/typescript/worker"
}
```

### Vite

#### React Applications

```typescript
// vite.config.ts
import { createReactAppConfig } from '@pkgs/config/vite/react-app';

export default createReactAppConfig({
  plugins: [
    // Add additional plugins here
  ],
  alias: {
    // Add additional aliases
  },
});
```

#### Libraries

```typescript
// vite.config.ts
import { createLibraryConfig } from '@pkgs/config/vite/library';
import { resolve } from 'node:path';

export default createLibraryConfig({
  entry: {
    index: resolve(__dirname, 'src/index.ts'),
  },
  external: ['react', 'react-dom'],
});
```

### Tailwind CSS

```javascript
// tailwind.config.js
import baseConfig from '@pkgs/config/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  // Override or extend theme as needed
};
```

### Linting (oxlint)

Copy the config or reference it:

```bash
# Copy to your package
cp node_modules/@pkgs/config/.oxlintrc.json .

# Or use directly in scripts
bunx oxlint --config=./node_modules/@pkgs/config/.oxlintrc.json .
```

## Available Configurations

### TypeScript

- `@pkgs/config/typescript/base` - Base TypeScript configuration
- `@pkgs/config/typescript/react-app` - For React applications
- `@pkgs/config/typescript/react-library` - For React library packages
- `@pkgs/config/typescript/library` - For Node/library packages
- `@pkgs/config/typescript/worker` - For Cloudflare Workers

### Vite

- `@pkgs/config/vite/react-app` - React app configuration factory
- `@pkgs/config/vite/library` - Library build configuration factory

### Tailwind

- `@pkgs/config/tailwind` - Base Tailwind CSS configuration

### Linting

- `@pkgs/config/oxlint` - oxlint configuration

## Benefits

- **Consistency**: Ensures all packages use the same base configurations
- **DRY**: No need to duplicate config files across packages
- **Maintainability**: Update configs in one place
- **Type Safety**: Shared TypeScript configurations with proper types
- **Flexibility**: Configs can be extended or overridden as needed

## License

MIT
