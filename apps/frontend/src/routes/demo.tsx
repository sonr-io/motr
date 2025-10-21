import {
  Badge,
  Button,
  ChainSelector,
  GlassCard,
  GlassCardContent,
  GlassCardDescription,
  GlassCardHeader,
  GlassCardTitle,
  Separator,
  useChains,
} from "@sonr.io/ui";
import { FloatingHeader } from "@sonr.io/ui/components/ui/floating-header";
import { HoverButton } from "@sonr.io/ui/components/ui/hover-button";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/demo")({
  component: Demo,
});

function Demo() {
  const [selectedChain, setSelectedChain] = useState<string>("");
  const { chains, loading: chainsLoading, error: chainsError } = useChains();
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "requesting" | "success" | "error"
  >("idle");
  const [paymentResult, setPaymentResult] = useState<string | null>(null);

  const selectedChainData = chains.find((c) => c.id === selectedChain);

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
        <div className="w-full max-w-xl px-6 mb-12">
          <h1 className="text-center font-serif text-4xl font-stretch-semi-condensed text-foreground/85 drop-shadow-lg md:text-5xl lg:text-6xl mb-4">
            Feature Demos
          </h1>
          <p className="text-center backdrop-blur-xs text-base drop-shadow-md text-foreground/70 md:text-lg max-w-xl mx-auto">
            Explore the capabilities of Sonr's identity and payment systems
          </p>
        </div>

        {/* Blockchain Selector Demo */}
        <div className="w-full max-w-2xl px-6 mt-8">
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Blockchain Network Selector</GlassCardTitle>
              <GlassCardDescription>
                Select from available Cosmos ecosystem chains
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              {chainsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-pulse text-sm text-muted-foreground">
                    Loading chains...
                  </div>
                </div>
              ) : chainsError ? (
                <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/50 text-destructive">
                  {chainsError}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Available Chains</span>
                    <Badge variant="outline">{chains.length} Networks</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Chain</label>
                    <ChainSelector
                      chains={chains}
                      value={selectedChain}
                      onValueChange={setSelectedChain}
                      placeholder="Choose a blockchain..."
                      className="w-full"
                    />
                  </div>

                  {selectedChainData && (
                    <>
                      <Separator />
                      <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          {selectedChainData.icon && typeof selectedChainData.icon === 'function' && (
                            <selectedChainData.icon className="h-6 w-6" />
                          )}
                          <div className="text-sm font-medium">
                            {selectedChainData.name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Chain ID: <span className="font-mono">{selectedChain}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Connected to {selectedChainData.name} network
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </GlassCardContent>
          </GlassCard>
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
