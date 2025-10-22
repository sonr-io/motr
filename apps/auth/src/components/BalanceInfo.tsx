import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@sonr.io/ui";
import { useState } from "react";
import { useBalanceQuery } from "@/queries";

/**
 * Component to demonstrate querying balance information with auto-refresh
 */
export function BalanceInfo() {
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");

  const { data, isLoading, error, refetch } = useBalanceQuery({
    address: submittedAddress,
    enabled: !!submittedAddress,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAddress(address);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Query</CardTitle>
        <CardDescription>
          Query native token balances (auto-refreshes every 30s)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="balance-address">Sonr Address</Label>
            <Input
              id="balance-address"
              type="text"
              placeholder="sonr1..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={!address || isLoading}>
              {isLoading ? "Loading..." : "Query Balances"}
            </Button>
            {submittedAddress && (
              <Button type="button" variant="outline" onClick={() => refetch()}>
                Refresh
              </Button>
            )}
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong>{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        )}

        {data != null && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Balances
            </p>
            <pre className="text-xs overflow-auto bg-white dark:bg-gray-800 p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
