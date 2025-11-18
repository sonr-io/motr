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

export function LoginFlow() {
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const authenticateWithPasskey = React.useCallback(async () => {
    setIsAuthenticating(true);
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
        toast.success('Login successful!');
        // Redirect to dashboard or home
        window.location.href = '/';
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to authenticate with passkey');
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return (
    <GlassCard className="w-full">
      <GlassCardHeader>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground/85">Authenticate with passkey</h2>
          <p className="text-sm text-muted-foreground mt-1">Use your passkey to complete login</p>
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Click the button below to authenticate with your passkey
          </p>
        </div>
      </GlassCardContent>

      <GlassCardFooter className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/register">
            <Button variant="ghost" size="sm" type="button">
              Create account
            </Button>
          </Link>
          <Button
            variant="glass"
            size="default"
            onClick={authenticateWithPasskey}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? 'Authenticating...' : 'Use Passkey'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Create one here
          </Link>
        </p>
      </GlassCardFooter>
    </GlassCard>
  );
}
