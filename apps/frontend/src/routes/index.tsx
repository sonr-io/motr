import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@sonr.io/ui/components/auth/register-form";
import { HoleBackground } from "@sonr.io/ui/components/backgrounds/hole";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <HoleBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
      <div className="flex w-full max-w-sm flex-col gap-6 backdrop-blur-lg z-10">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"></div>
          Acme Inc.
        </a>
        <RegisterForm />
      </div>
    </div>
  );
}
