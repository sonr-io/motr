import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "@sonr.io/ui/components/auth/register-form";

export const Route = createFileRoute("/register")({
  component: App,
});

function App() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* 50% overlay to focus content */}
      <div
        className="fixed inset-0 bg-background/40 backdrop-blur-xl"
        style={{ viewTransitionName: "register-overlay" }}
      />

      <div
        className="flex w-full max-w-sm flex-col gap-6 z-10"
        style={{ viewTransitionName: "register-page" }}
      >
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            {/* <SonrLogo className="text-foreground" size={24} /> */}
          </div>
          Sonr.ID
        </a>
        <RegisterForm />
      </div>
    </div>
  );
}
