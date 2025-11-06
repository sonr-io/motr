import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    try {
      // Fetch session data from worker
      const response = await fetch("/api/session");
      const session = await response.json();

      // Determine where to redirect based on session state
      if (session.authenticated) {
        // User is already authenticated, redirect to console
        throw redirect({ to: "/console/" });
      }

      if (session.auth?.hasAccount) {
        // User has an account, redirect to login
        throw redirect({ to: "/login" });
      }

      // Check if user started registration recently
      if (session.auth?.registrationStartedAt) {
        const hoursSinceStart =
          (Date.now() - session.auth.registrationStartedAt) / (1000 * 60 * 60);
        if (hoursSinceStart < 24) {
          // Continue registration
          throw redirect({ to: "/register" });
        }
      }

      // Check if user visited login before
      if (
        session.auth?.hasVisitedBefore &&
        session.auth?.lastAuthPage === "login"
      ) {
        throw redirect({ to: "/login" });
      }

      // Default: redirect to register for new users
      throw redirect({ to: "/register" });
    } catch (error) {
      // If error is a redirect, re-throw it
      if (error && typeof error === "object" && "to" in error) {
        throw error;
      }
      // Otherwise, default to register
      throw redirect({ to: "/register" });
    }
  },
});
