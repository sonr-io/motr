import { useState } from "react";
import { ChainSelector, useChains, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sonr.io/ui";

/**
 * Example component demonstrating how to use the ChainSelector with icons
 */
export function ChainSelectorDemo() {
  const [selectedChain, setSelectedChain] = useState<string>("");
  const { chains, loading, error } = useChains();

  const selectedChainData = chains.find((c) => c.id === selectedChain);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading chains...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Select a Blockchain</CardTitle>
          <CardDescription>
            Choose from {chains.length} available Cosmos chains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChainSelector
            chains={chains}
            value={selectedChain}
            onValueChange={setSelectedChain}
            placeholder="Choose a chain..."
            className="w-full"
          />
        </CardContent>
      </Card>

      {selectedChainData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedChainData.icon && (
                <selectedChainData.icon className="h-6 w-6" />
              )}
              {selectedChainData.name}
            </CardTitle>
            <CardDescription>Chain ID: {selectedChain}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Connected to {selectedChainData.name} network
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
