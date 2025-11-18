import { Separator } from '@sonr.io/ui/components';
import { Button } from '@sonr.io/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@sonr.io/ui/components/ui/form';
import {
  GlassCard,
  GlassCardContent,
  GlassCardFooter,
  GlassCardHeader,
} from '@sonr.io/ui/components/ui/glass-card';
import { Input } from '@sonr.io/ui/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@sonr.io/ui/components/ui/input-otp';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits'),
});

type FormSchema = z.infer<typeof formSchema>;

type LoginStep = 'email' | 'verify' | 'passkey';

export function LoginFlow() {
  const [currentStep, setCurrentStep] = React.useState<LoginStep>('email');
  const [isSendingOTP, setIsSendingOTP] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = React.useState(0);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      otpCode: '',
    },
  });

  // Countdown timer for rate limiting
  React.useEffect(() => {
    if (rateLimitSeconds <= 0) return;

    const intervalId = setInterval(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [rateLimitSeconds]);

  const sendOTP = React.useCallback(
    async (email: string) => {
      if (rateLimitSeconds > 0) {
        toast.error(`Please wait ${rateLimitSeconds} seconds before requesting another code`);
        return false;
      }

      setIsSendingOTP(true);
      try {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            purpose: 'login',
            expiresInMinutes: 10,
          }),
        });

        const data: { success?: boolean; remainingSeconds?: number; error?: string } =
          await response.json();

        if (!data.success) {
          if (data.remainingSeconds) {
            setRateLimitSeconds(data.remainingSeconds);
          }
          throw new Error(data.error || 'Failed to send OTP');
        }

        toast.success('OTP sent to your email! Check your inbox.');
        setRateLimitSeconds(60); // Set 1 minute cooldown
        setCurrentStep('verify');
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
        return false;
      } finally {
        setIsSendingOTP(false);
      }
    },
    [rateLimitSeconds]
  );

  const verifyOTP = React.useCallback(async (email: string, code: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data: { success?: boolean; error?: string } = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      toast.success('Email verified successfully!');
      setCurrentStep('passkey');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify OTP');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const authenticateWithPasskey = React.useCallback(async () => {
    setIsAuthenticating(true);
    try {
      // TODO: Implement WebAuthn passkey authentication
      // This will be integrated with the Enclave worker
      toast.info('Passkey authentication coming soon!');

      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Login successful!');
      // Redirect to console or user's default app
      window.location.href = '/console/';
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to authenticate with passkey');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const handleEmailSubmit = React.useCallback(async () => {
    const isValid = await form.trigger('email');
    if (!isValid) return;

    const email = form.getValues('email');
    await sendOTP(email);
  }, [form, sendOTP]);

  const handleOTPSubmit = React.useCallback(async () => {
    const isValid = await form.trigger('otpCode');
    if (!isValid) return;

    const email = form.getValues('email');
    const code = form.getValues('otpCode');
    await verifyOTP(email, code);
  }, [form, verifyOTP]);

  return (
    <Form {...form}>
      <GlassCard className="w-full">
        <GlassCardHeader>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground/85">
              {currentStep === 'email' && 'Enter your email'}
              {currentStep === 'verify' && 'Verify your email'}
              {currentStep === 'passkey' && 'Authenticate with passkey'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStep === 'email' && "We'll send you a verification code"}
              {currentStep === 'verify' && 'Enter the code sent to your email'}
              {currentStep === 'passkey' && 'Use your passkey to complete login'}
            </p>
          </div>
        </GlassCardHeader>

        <GlassCardContent className="space-y-6">
          {currentStep === 'email' && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      type="email"
                      {...field}
                      className="transition-all"
                      disabled={isSendingOTP}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleEmailSubmit();
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs mt-2">
                    {rateLimitSeconds > 0 ? (
                      <span className="text-amber-500">
                        Wait {rateLimitSeconds}s before requesting another code
                      </span>
                    ) : (
                      'Enter the email associated with your Sonr account'
                    )}
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}

          {currentStep === 'verify' && (
            <FormField
              control={form.control}
              name="otpCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Verification Code</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-3">
                      <InputOTP maxLength={6} {...field} disabled={isVerifying}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs mt-2 text-center">
                    Enter the 6-digit code sent to {form.getValues('email')}
                  </FormDescription>
                  <FormMessage className="text-xs text-center" />
                </FormItem>
              )}
            />
          )}

          {currentStep === 'passkey' && (
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
          )}
        </GlassCardContent>

        <Separator />

        <GlassCardFooter className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            {currentStep === 'email' && (
              <>
                <a href="/register">
                  <Button variant="ghost" size="sm" type="button">
                    Create account
                  </Button>
                </a>
                <Button
                  variant="glass"
                  size="default"
                  onClick={handleEmailSubmit}
                  disabled={isSendingOTP}
                >
                  {isSendingOTP ? 'Sending...' : 'Send Code'}
                </Button>
              </>
            )}

            {currentStep === 'verify' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setCurrentStep('email')}
                >
                  Back
                </Button>
                <Button
                  variant="glass"
                  size="default"
                  onClick={handleOTPSubmit}
                  disabled={isVerifying}
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </>
            )}

            {currentStep === 'passkey' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setCurrentStep('verify')}
                >
                  Back
                </Button>
                <Button
                  variant="glass"
                  size="default"
                  onClick={authenticateWithPasskey}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Authenticating...' : 'Use Passkey'}
                </Button>
              </>
            )}
          </div>

          {currentStep === 'email' && (
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account?{' '}
              <a href="/register" className="text-primary hover:underline">
                Create one here
              </a>
            </p>
          )}
        </GlassCardFooter>
      </GlassCard>
    </Form>
  );
}
