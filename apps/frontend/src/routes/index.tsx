import { createFileRoute } from "@tanstack/react-router";
import { HoleBackground } from "@sonr.io/ui/components/backgrounds/hole";
// import { SonrLogo } from "@sonr.io/ui/components/logos/sonr";
import { HoverButton } from "@sonr.io/ui/components/ui/hover-button";
import { FloatingHeader } from "@sonr.io/ui/components/ui/floating-header";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-5 left-0 right-0 z-50 px-4">
        <FloatingHeader />
      </div>

      <HoleBackground className="absolute inset-0 flex items-center justify-center" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 md:px-10">
        <div className="flex w-full max-w-md flex-col items-center gap-8 lg:max-w-lg">
          <h1 className="text-center font-serif text-5xl font-stretch-semi-condensed text-foreground/75 drop-shadow-sm md:text-5xl lg:text-7xl">
            Your <span className="italic tracking-tight">Personal</span>{" "}
            <span className="whitespace-nowrap">Identity Gateway</span>
          </h1>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <HoverButton to="/register" text="Get Started" />
          </div>
        </div>
      </div>
    </div>
  );
}
