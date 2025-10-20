import { useEnclave } from '@sonr.io/react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from '@sonr.io/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/payment')({
  component: PaymentComponent,
});

interface PaymentDetails {
  paymentRequestId: string;
  total: string;
  currency: string;
  merchantOrigin: string;
}

function PaymentComponent() {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'cancelled'>(
    'pending'
  );
  const [error, setError] = useState<string | null>(null);
  const { isReady, accountAddress } = useEnclave();

  useEffect(() => {
    // Extract payment details from URL parameters
    const params = new URLSearchParams(window.location.search);
    const details: PaymentDetails = {
      paymentRequestId: params.get('paymentRequestId') || '',
      total: params.get('total') || '0',
      currency: params.get('currency') || 'USD',
      merchantOrigin: params.get('merchantOrigin') || '',
    };

    setPaymentDetails(details);
  }, []);

  const handleConfirmPayment = async () => {
    if (!paymentDetails) return;

    setStatus('processing');
    setError(null);

    try {
      // Create W3C PaymentRequest data structure
      const paymentRequestData = {
        topOrigin: paymentDetails.merchantOrigin,
        paymentRequestOrigin: paymentDetails.merchantOrigin,
        paymentRequestId: paymentDetails.paymentRequestId,
        methodData: [
          {
            supportedMethods: `${window.location.origin}/pay`,
            data: {
              accountAddress,
            },
          },
        ],
        total: {
          label: 'Total',
          amount: {
            currency: paymentDetails.currency,
            value: paymentDetails.total,
          },
        },
        timestamp: Date.now(),
      };

      console.log('[Payment UI] Processing payment via vault WASM HTTP server...');

      // Process payment via vault's WASM HTTP server
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequestData),
      });

      if (!response.ok) {
        throw new Error(`Payment processing failed: ${response.statusText}`);
      }

      const transaction = await response.json();

      console.log('[Payment UI] Payment transaction:', transaction);

      // Prepare payment response with transaction details
      const paymentResponse = {
        methodName: `${window.location.origin}/pay`,
        details: {
          transactionId: transaction.id || transaction.ID,
          status: transaction.status || transaction.Status,
          response: transaction.response || transaction.Response,
          timestamp: Date.now(),
        },
      };

      console.log('[Payment UI] Payment confirmed:', paymentResponse);

      // Send confirmation to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PAYMENT_CONFIRMED',
          paymentRequestId: paymentDetails.paymentRequestId,
          paymentDetails: paymentResponse.details,
        });
      }

      setStatus('success');

      // Close window after short delay
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (err) {
      console.error('[Payment UI] Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStatus('pending');
    }
  };

  const handleCancelPayment = () => {
    if (!paymentDetails) return;

    console.log('[Payment UI] Payment cancelled');

    // Send cancellation to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PAYMENT_CANCELLED',
        paymentRequestId: paymentDetails.paymentRequestId,
      });
    }

    setStatus('cancelled');

    // Close window after short delay
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  if (!paymentDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Loading payment details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Request</CardTitle>
            <Badge
              variant={
                status === 'success'
                  ? 'default'
                  : status === 'cancelled'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {status}
            </Badge>
          </div>
          <CardDescription>
            Confirm payment to {new URL(paymentDetails.merchantOrigin).hostname}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-2xl font-bold">
                {paymentDetails.total} {paymentDetails.currency}
              </span>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Merchant</span>
                <span className="font-medium">
                  {new URL(paymentDetails.merchantOrigin).hostname}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">Sonr Crypto Wallet</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Account</span>
                <span className="font-mono text-xs">
                  {accountAddress
                    ? `${accountAddress.slice(0, 10)}...${accountAddress.slice(-8)}`
                    : 'Not connected'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{isReady ? 'Ready' : 'Not Ready'}</Badge>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                Payment confirmed! This window will close automatically.
              </p>
            </div>
          )}

          {status === 'cancelled' && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                Payment cancelled. This window will close automatically.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancelPayment}
            disabled={status === 'processing' || status === 'success' || status === 'cancelled'}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirmPayment}
            disabled={
              !isReady || status === 'processing' || status === 'success' || status === 'cancelled'
            }
          >
            {status === 'processing' ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
