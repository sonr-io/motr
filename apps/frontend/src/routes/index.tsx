import { createFileRoute } from "@tanstack/react-router";
import { HoverButton } from "@sonr.io/ui/components/ui/hover-button";
import { FloatingHeader } from "@sonr.io/ui/components/ui/floating-header";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="relative h-svh w-full overflow-hidden">
      <div className="absolute top-4 left-0 right-0 z-50 px-4 md:px-6">
        <FloatingHeader />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-8 p-6 lg:max-w-2xl rounded-full mb-12">
          <h1 className="text-center font-serif text-4xl font-stretch-semi-condensed text-foreground/85 drop-shadow-lg md:text-5xl lg:text-7xl">
            Your <span className="italic tracking-tight">Personal</span>{" "}
            <span className="whitespace-nowrap">Identity Gateway</span>
          </h1>
          <p className="text-center backdrop-blur-xs text-base drop-shadow-md text-foreground/70 md:text-lg lg:text-xl max-w-xl">
            Protect your digital footprint with Sonr - the Next-Generation
            Blockchain Secured Wallet Identity System.

          </p>
          <div className="mt-2 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <HoverButton text="Get Started" to="/register" />
          </div>
        </div>
      </div>
    </div>
  );
}
