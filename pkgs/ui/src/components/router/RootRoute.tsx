import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

/**
 * Standard root route component for TanStack Router apps
 *
 * Provides a minimal layout with router devtools in development.
 * Apps can customize this by creating their own root route.
 *
 * @example
 * ```tsx
 * // In your routes/__root.tsx
 * export { Route } from '@sonr.io/ui/components/router';
 * ```
 */
export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  ),
});
