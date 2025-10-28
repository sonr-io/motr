// TODO: Re-enable when motion/framer-motion ESM issues are resolved
// import { HoleBackground } from "@sonr.io/ui/components/backgrounds/hole";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="relative min-h-svh w-full">
      {/* TODO: Re-enable when motion/framer-motion ESM issues are resolved */}
      {/* <HoleBackground className="fixed inset-0 flex items-center justify-center" /> */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-muted to-background" />
      <div className="relative z-10">
        <Outlet />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
