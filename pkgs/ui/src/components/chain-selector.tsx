import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import * as Icons from "./icons";

export interface ChainOption {
  id: string;
  name: string;
  logo?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ChainSelectorProps {
  chains: ChainOption[];
  value?: string;
  onValueChange?: (chainId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ChainSelector({
  chains,
  value,
  onValueChange,
  placeholder = "Select a chain...",
  disabled = false,
  className,
}: ChainSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Cosmos Chains</SelectLabel>
          {chains.map((chain) => {
            const ChainIcon = chain.icon;
            const isValidIcon = ChainIcon && typeof ChainIcon === 'function';
            return (
              <SelectItem key={chain.id} value={chain.id}>
                <div className="flex items-center gap-2">
                  {isValidIcon ? (
                    <ChainIcon className="h-4 w-4" />
                  ) : chain.logo ? (
                    <img
                      src={chain.logo}
                      alt={chain.name}
                      className="h-4 w-4 rounded-full"
                    />
                  ) : null}
                  <span>{chain.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// Hook to fetch chains from the API
export function useChains() {
  const [chains, setChains] = React.useState<ChainOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchChains() {
      try {
        setLoading(true);
        const response = await fetch("/api/chains");

        if (!response.ok) {
          throw new Error("Failed to fetch chains");
        }

        const data = await response.json();

        // Transform chain IDs to display names with icons
        const chainOptions: ChainOption[] = data.chains.map((id: string) => {
          const icon = getChainIcon(id);
          return {
            id,
            name: formatChainName(id),
            icon,
            // Only include logo if we don't have an icon component
            logo: !icon ? undefined : undefined,
          };
        });

        setChains(chainOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchChains();
  }, []);

  return { chains, loading, error };
}

// Helper to format chain ID into display name
function formatChainName(chainId: string): string {
  return chainId
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Fuzzy match chain ID to crypto icon
function getChainIcon(chainId: string): React.ComponentType<{ className?: string }> | undefined {
  // Map of chain IDs to their common token symbols
  const chainToSymbol: Record<string, string> = {
    cosmoshub: "ATOM",
    osmosis: "OSMO",
    juno: "JUNO",
    stargaze: "STARS",
    akash: "AKT",
    celestia: "TIA",
    dydx: "DYDX",
    noble: "USDC",
    neutron: "NTRN",
    injective: "INJ",
    kujira: "KUJI",
    stride: "STRD",
    evmos: "EVMOS",
    axelar: "AXL",
    terra2: "LUNA",
  };

  const symbol = chainToSymbol[chainId.toLowerCase()];
  if (!symbol) return undefined;

  // Try to find the matching Crypto icon
  const iconName = `Crypto${symbol.toUpperCase()}` as keyof typeof Icons;
  const IconComponent = Icons[iconName];

  return IconComponent as React.ComponentType<{ className?: string }> | undefined;
}
