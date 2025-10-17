import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import { GlassCard, GlassCardHeader, GlassCardContent } from "@sonr.io/ui/components/ui/glass-card";
import { Input } from "@sonr.io/ui/components/ui/input";
import { Textarea } from "@sonr.io/ui/components/ui/textarea";
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
 
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  website: z.url("Please enter a valid URL").optional().or(z.literal("")),
});
 
type FormSchema = z.infer<typeof formSchema>;
 
const steps = [
  {
    value: "personal",
    title: "Personal Details",
    description: "Enter your basic information",
    fields: ["firstName", "lastName", "email"] as const,
  },
  {
    value: "about",
    title: "About You",
    description: "Tell us more about yourself",
    fields: ["bio"] as const,
  },
  {
    value: "professional",
    title: "Professional Info",
    description: "Add your professional details",
    fields: ["company", "website"] as const,
  },
];
 
export function RegisterFlow() {
  const [currentStep, setCurrentStep] = React.useState("personal");
 
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
      company: "",
      website: "",
    },
  });
 
  const currentIndex = steps.findIndex((step) => step.value === currentStep);
 
  const onValidate: NonNullable<StepperProps["onValidate"]> = React.useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;
 
      const currentStepData = steps.find((s) => s.value === currentStep);
      if (!currentStepData) return true;
 
      const isValid = await form.trigger(currentStepData.fields);
 
      if (!isValid) {
        toast.info("Please complete all required fields to continue");
      }
 
      return isValid;
    },
    [form, currentStep],
  );
 
  const onValueChange = React.useCallback((value: string) => {
    setCurrentStep(value);
  }, []);
 
  const onSubmit = React.useCallback((input: FormSchema) => {
    toast.success(
      <pre className="w-full">{JSON.stringify(input, null, 2)}</pre>,
    );
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
                <GlassCardHeader className="pb-6">
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
                <GlassCardContent className="pt-6">
          <StepperContent value="personal">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel className="font-medium">
                        Last Name
                      </FormLabel>
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
              </div>
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
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </StepperContent>
          <StepperContent value="about">
            <div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Biography
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="min-h-[160px] resize-none transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-xs mt-2">
                      Write a brief description about yourself (minimum 10 characters)
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </StepperContent>
          <StepperContent value="professional">
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Company Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Inc."
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                        className="transition-all"
                      />
                    </FormControl>
                    <FormDescription className="text-muted-foreground text-xs mt-2">
                      Optional: Your personal or company website
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </StepperContent>
                </GlassCardContent>

                {/* Footer Navigation */}
                <div className="mt-8 mb-6 flex items-center justify-between px-6">
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
                      <Button variant="glass" size="default">Next Step</Button>
                    </StepperNextTrigger>
                  )}
                </div>
              </Stepper>
            </form>
        </GlassCard>
      </Form>
  );
}
