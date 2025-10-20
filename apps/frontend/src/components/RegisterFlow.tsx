import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@sonr.io/ui/components";
import { Button } from "@sonr.io/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sonr.io/ui/components/ui/form";
import {
  GlassCard,
  GlassCardContent,
  GlassCardHeader,
} from "@sonr.io/ui/components/ui/glass-card";
import { Input } from "@sonr.io/ui/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@sonr.io/ui/components/ui/input-otp";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  type StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@sonr.io/ui/components/ui/stepper";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otpCode: z.string().length(6, "OTP code must be 6 digits"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

type FormSchema = z.infer<typeof formSchema>;

const steps = [
  {
    value: "email",
    title: "Email",
    description: "Enter your email",
    fields: ["email"] as const,
  },
  {
    value: "verify",
    title: "Verify",
    description: "Enter OTP code",
    fields: ["otpCode"] as const,
  },
  {
    value: "passkey",
    title: "Passkey",
    description: "Create passkey",
    fields: ["firstName", "lastName"] as const,
  },
];

export function RegisterFlow() {
  const [currentStep, setCurrentStep] = React.useState("email");
  const [isSendingOTP, setIsSendingOTP] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      otpCode: "",
      firstName: "",
      lastName: "",
    },
  });

  const currentIndex = steps.findIndex((step) => step.value === currentStep);

  const sendOTP = React.useCallback(async (email: string) => {
    setIsSendingOTP(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          purpose: "registration",
          expiresInMinutes: 10,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast.success("OTP sent to your email! Check your inbox.");
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP",
      );
      return false;
    } finally {
      setIsSendingOTP(false);
    }
  }, []);

  const verifyOTP = React.useCallback(
    async (email: string, code: string) => {
      setIsVerifying(true);
      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Invalid OTP code");
        }

        toast.success("Email verified successfully!");
        return true;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to verify OTP",
        );
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [],
  );

  const onValidate: NonNullable<StepperProps["onValidate"]> = React.useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;

      const currentStepData = steps.find((s) => s.value === currentStep);
      if (!currentStepData) return true;

      const isValid = await form.trigger(currentStepData.fields);

      if (!isValid) {
        toast.info("Please complete all required fields to continue");
        return false;
      }

      // Send OTP when moving from email step
      if (currentStep === "email") {
        const email = form.getValues("email");
        const otpSuccess = await sendOTP(email);
        if (!otpSuccess) {
          return false;
        }
      }

      // Verify OTP when moving from verify step
      if (currentStep === "verify") {
        const email = form.getValues("email");
        const code = form.getValues("otpCode");
        const verifySuccess = await verifyOTP(email, code);
        if (!verifySuccess) {
          return false;
        }
      }

      return true;
    },
    [form, currentStep, sendOTP, verifyOTP],
  );

  const onValueChange = React.useCallback((value: string) => {
    setCurrentStep(value);
  }, []);

  const onSubmit = React.useCallback((input: FormSchema) => {
    toast.success("Registration complete!", {
      description: `Welcome, ${input.firstName} ${input.lastName}!`,
    });
    console.log("Registration data:", input);
  }, []);

  return (
    <Form {...form}>
      <GlassCard className="w-full">
        <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
          <Stepper
            value={currentStep}
            onValueChange={onValueChange}
            onValidate={onValidate}
          >
            <GlassCardHeader>
              <StepperList className="gap-2">
                {steps.map((step) => (
                  <StepperItem key={step.value} value={step.value}>
                    <StepperTrigger className="group hover:bg-accent/50 transition-all rounded-lg p-3">
                      <StepperIndicator className="transition-all" />
                      <div className="flex flex-col gap-1 text-left">
                        <StepperTitle className="text-foreground/85 drop-shadow-sm group-hover:text-foreground transition-all">
                          {step.title}
                        </StepperTitle>
                        <StepperDescription className="text-muted-foreground text-xs">
                          {step.description}
                        </StepperDescription>
                      </div>
                    </StepperTrigger>
                    <StepperSeparator className="mx-2 bg-border/50" />
                  </StepperItem>
                ))}
              </StepperList>
            </GlassCardHeader>
            <GlassCardContent>
              <StepperContent value="email">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john.doe@example.com"
                          type="email"
                          {...field}
                          className="transition-all"
                          disabled={isSendingOTP}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground text-xs mt-2">
                        We'll send a verification code to this email
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </StepperContent>

              <StepperContent value="verify">
                <FormField
                  control={form.control}
                  name="otpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
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
                        Enter the 6-digit code sent to {form.getValues("email")}
                      </FormDescription>
                      <FormMessage className="text-xs text-center" />
                    </FormItem>
                  )}
                />
              </StepperContent>

              <StepperContent value="passkey">
                <div className="flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          First Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            {...field}
                            className="transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            {...field}
                            className="transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormDescription className="text-muted-foreground text-xs">
                    Your name will be used to create your Sonr identity
                  </FormDescription>
                </div>
              </StepperContent>
            </GlassCardContent>

            <Separator />
            {/* Footer Navigation */}
            <div className="mt-4mb-6 flex items-center justify-between px-6">
              <StepperPrevTrigger asChild>
                <Button variant="glass" size="default">
                  Previous
                </Button>
              </StepperPrevTrigger>

              <div className="text-muted-foreground text-sm font-medium">
                Step {currentIndex + 1} of {steps.length}
              </div>

              {currentIndex === steps.length - 1 ? (
                <Button type="submit" variant="glass" size="default">
                  Complete Registration
                </Button>
              ) : (
                <StepperNextTrigger asChild>
                  <Button variant="glass" size="default">
                    Next Step
                  </Button>
                </StepperNextTrigger>
              )}
            </div>
          </Stepper>
        </form>
      </GlassCard>
    </Form>
  );
}
