import { Button } from '@sonr.io/ui/components/ui/button';
import {
  GlassCard,
  GlassCardContent,
  GlassCardFooter,
  GlassCardHeader,
} from '@sonr.io/ui/components/ui/glass-card';
import { Link } from '@tanstack/react-router';
import * as React from 'react';
import { toast } from 'sonner';
import { registerWithPasskey } from '@sonr.io/sdk/client/auth';

export function RegisterFlow() {
  const [isRegistering, setIsRegistering] = React.useState(false);

  const registerWithPasskeyHandler = React.useCallback(async () => {
    setIsRegistering(true);
    try {
      // Use the SDK's WebAuthn functionality
      const result = await registerWithPasskey(window.location.origin, {
        username: 'user', // This would come from a form in a real implementation
        config: {
          onStatusUpdate: (message: string, type: 'info' | 'success' | 'error' | 'warning') => {
            if (type === 'error') {
              toast.error(message);
            } else if (type === 'success') {
              toast.success(message);
            } else {
              toast.info(message);
            }
          },
        },
      });

      if (result.success) {
        // Set authentication state
        localStorage.setItem('authenticated', 'true');
        toast.success('Registration successful!');
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register with passkey');
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return (
    <GlassCard className="w-full">
      <GlassCardHeader>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground/85">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Register with a passkey for secure authentication
          </p>
        </div>
      </GlassCardHeader>

      <GlassCardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Click the button below to create your account with a passkey
          </p>
        </div>
      </GlassCardContent>

      <GlassCardFooter className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/login">
            <Button variant="ghost" size="sm" type="button">
              Sign in instead
            </Button>
          </Link>
          <Button
            variant="glass"
            size="default"
            onClick={registerWithPasskeyHandler}
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </GlassCardFooter>
    </GlassCard>
  );
}
