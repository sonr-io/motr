import { createRouter } from '@tanstack/react-router';
import { getProvidersContext } from './lib/providers';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
export const getRouter = () => {
  const providersContext = getProvidersContext();

  const router = createRouter({
    routeTree,
    context: {
      ...providersContext,
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
