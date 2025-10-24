import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter, type AnyRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// This needs to be at top level for TypeScript module augmentation
declare module '@tanstack/react-router' {
  interface Register {
    router: AnyRouter;
  }
}

export interface AppRouterOptions {
  /**
   * The generated route tree from TanStack Router
   */
  routeTree: any;

  /**
   * Optional query client configuration
   */
  queryClientConfig?: {
    staleTime?: number;
    gcTime?: number;
  };

  /**
   * ID of the root element to mount the app
   * @default 'root'
   */
  rootElementId?: string;

  /**
   * Whether to show React Query DevTools
   * @default false
   */
  showDevtools?: boolean;
}

/**
 * Creates and renders a standard React app with TanStack Router and Query
 *
 * This is a shared component that provides the standard boilerplate for
 * console, profile, and search apps.
 *
 * @example
 * ```tsx
 * import { renderAppRouter } from '@sonr.io/ui/components/router';
 * import { routeTree } from './routeTree.gen';
 *
 * renderAppRouter({ routeTree });
 * ```
 */
export function renderAppRouter(options: AppRouterOptions) {
  const {
    routeTree,
    queryClientConfig = {},
    rootElementId = 'root',
    showDevtools = false,
  } = options;

  // Create a new router instance
  const router = createRouter({ routeTree });

  // Create a query client with default or custom configuration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: queryClientConfig.staleTime ?? 1000 * 60 * 5, // 5 minutes
        gcTime: queryClientConfig.gcTime ?? 1000 * 60 * 10, // 10 minutes
      },
    },
  });

  // Render the app
  const rootElement = document.getElementById(rootElementId);
  if (rootElement && !rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </StrictMode>
    );
  }
}
