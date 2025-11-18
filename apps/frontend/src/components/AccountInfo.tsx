import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@sonr.io/ui';
import { useState } from 'react';

/**
 * Component to demonstrate querying account information
 */
export function AccountInfo() {
  const [address, setAddress] = useState('');
  const [submittedAddress, setSubmittedAddress] = useState('');

  // For now, just show a placeholder - will integrate with actual queries later
  const isLoading = false;
  const error = null;
  const data = submittedAddress ? { address: submittedAddress, balance: '0' } : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAddress(address);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Query</CardTitle>
        <CardDescription>Query account information from the Sonr blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Sonr Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="sonr1..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button type="submit" disabled={!address || isLoading}>
            {isLoading ? 'Loading...' : 'Query Account'}
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Error:</strong> {typeof error === 'string' ? error : 'Unknown error'}
            </p>
          </div>
        )}

        {data != null && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              Account Found
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
