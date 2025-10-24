import '@sonr.io/ui/styles/globals.css';
import { renderAppRouter } from '@sonr.io/ui';
import { routeTree } from './routeTree.gen';

renderAppRouter({
  routeTree,
  showDevtools: import.meta.env.DEV,
});
