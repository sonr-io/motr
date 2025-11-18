import { SonrIcon } from "@sonr.io/ui/components/ui/sonr-icon";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoginFlow } from "@/components/LoginFlow";

export const Route = createFileRoute("/login")({
  component: App,
});

function App() {
  // Track page visit for session state management
  useEffect(() => {
    fetch("/api/session/auth/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "login" }),
    }).catch((err) => console.error("Failed to track auth visit:", err));
  }, []);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* 50% overlay to focus content */}
      <div
        className="fixed inset-0 bg-background/40 backdrop-blur-xl"
        style={{ viewTransitionName: "login-overlay" }}
      />

      <div
        className="flex w-full max-w-xl flex-col gap-6 z-10"
        style={{ viewTransitionName: "login-page" }}
      >
        {/* Header Section */}
        <div className="mb-2 text-center w-full">
          <div className="flex items-center justify-center mb-4">
            <SonrIcon size={48} className="text-primary drop-shadow-lg" />
          </div>
          <h1 className="font-serif text-3xl font-stretch-semi-condensed text-foreground drop-shadow-lg md:text-4xl lg:text-5xl mb-3">
            Welcome <span className="italic tracking-tight">Back</span>
          </h1>
          <p className="text-sm drop-shadow-md text-muted-foreground md:text-base lg:text-lg max-w-2xl mx-auto">
            Sign in to access your Sonr identity
          </p>
        </div>

        <LoginFlow />
      </div>
    </div>
  );
}
