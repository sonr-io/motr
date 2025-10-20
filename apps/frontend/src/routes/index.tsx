import {
  Badge,
  Button,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
  Separator,
} from "@sonr.io/ui";
import { FloatingHeader } from "@sonr.io/ui/components/ui/floating-header";
import { HoverButton } from "@sonr.io/ui/components/ui/hover-button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "requesting" | "success" | "error"
  >("idle");
  const [paymentResult, setPaymentResult] = useState<string | null>(null);

  const handleTestPayment = async () => {
    if (!window.PaymentRequest) {
      setPaymentResult("Payment Request API not supported");
      setPaymentStatus("error");
      return;
    }

    setPaymentStatus("requesting");
    setPaymentResult(null);

    try {
      // Use dynamic payment method identifier based on current origin
      const paymentMethodId = `${window.location.origin}/pay`;

      const methodData = [
        {
          supportedMethods: paymentMethodId,
          data: { environment: "demo" },
        },
      ];

      const details = {
        total: {
          label: "Demo Payment",
          amount: { currency: "USD", value: "10.00" },
        },
      };

      const request = new PaymentRequest(methodData, details);
      const response = await request.show();
      await response.complete("success");

      setPaymentResult(
        `Payment successful! Transaction ID: ${response.details?.transactionId || "N/A"}`,
      );
      setPaymentStatus("success");
    } catch (err) {
      setPaymentResult(err instanceof Error ? err.message : "Payment failed");
      setPaymentStatus("error");
    }
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden">
      <div className="absolute top-4 left-0 right-0 z-50 px-4 md:px-6">
        <FloatingHeader />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center pt-24 pb-12">
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
            <HoverButton text="Start your Journey" to="/register" />
          </div>
        </div>

        {/* Identity Manager Demo */}
        <div className="w-full max-w-2xl px-6 mt-8">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Sonr Identity System</GlassCardTitle>
              <GlassCardDescription>
                Powered by SonrIdentityDurable from @pkgs/cloudflare
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Architecture</span>
                <Badge variant="outline">Cloudflare Durable Objects</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Backend</span>
                <span className="font-mono text-xs">@sonr.io/enclave</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage</span>
                <Badge variant="default">Persistent Global State</Badge>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="text-sm font-medium">Key Features:</div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>MPC-based key management</li>
                  <li>UCAN token operations</li>
                  <li>Cryptographic signing & verification</li>
                  <li>WebSocket real-time updates</li>
                  <li>Global state persistence</li>
                </ul>
              </div>

              <HoverButton
                text="Try Identity Manager"
                to="/identity"
                className="w-full"
              />
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Payment Handler Demo */}
        <div className="w-full max-w-2xl px-6 mt-8">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Payment Handler Demo</GlassCardTitle>
              <GlassCardDescription>
                Test the Sonr crypto wallet payment integration
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-mono text-xs">
                  {window.location.origin}/pay
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Support</span>
                <Badge
                  variant={window.PaymentRequest ? "default" : "destructive"}
                >
                  {window.PaymentRequest ? "Supported" : "Not Supported"}
                </Badge>
              </div>

              <Separator />

              <Button
                className="w-full"
                onClick={handleTestPayment}
                disabled={
                  paymentStatus === "requesting" || !window.PaymentRequest
                }
              >
                {paymentStatus === "requesting"
                  ? "Processing..."
                  : "Test Payment ($10.00)"}
              </Button>

              {paymentResult && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    paymentStatus === "success"
                      ? "bg-green-500/10 border border-green-500/50 text-green-600 dark:text-green-400"
                      : "bg-destructive/10 border border-destructive/50 text-destructive"
                  }`}
                >
                  {paymentResult}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
