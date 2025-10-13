import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sonr.io/ui'
import { AccountInfo } from '../components/AccountInfo'
import { BalanceInfo } from '../components/BalanceInfo'
import { getRpcUrl } from '../lib/client'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Sonr Frontend
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Minimal vanilla TanStack Query app with @sonr.io/sdk and @sonr.io/ui
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            RPC Endpoint: <code className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{getRpcUrl()}</code>
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <AccountInfo />
          <BalanceInfo />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>About This App</CardTitle>
            <CardDescription>
              A minimal example demonstrating TanStack Query with Sonr blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• <strong>@sonr.io/sdk</strong> - Blockchain client with RPC APIs, wallet support, and passkey authentication</li>
                <li>• <strong>@sonr.io/ui</strong> - Comprehensive UI component library built on Radix UI and Tailwind CSS</li>
                <li>• <strong>TanStack Query</strong> - Powerful data fetching with caching, background updates, and devtools</li>
                <li>• <strong>TanStack Router</strong> - Type-safe routing with automatic code splitting</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Query Features Demonstrated</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Custom query hooks with proper TypeScript types</li>
                <li>• Automatic caching and stale-time configuration</li>
                <li>• Background refetching for real-time data</li>
                <li>• Error handling and loading states</li>
                <li>• Manual refetch capabilities</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Project Structure</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300 font-mono">
                <li>├── src/components/ - Reusable UI components</li>
                <li>├── src/queries/ - TanStack Query hooks</li>
                <li>├── src/lib/ - Utility functions and clients</li>
                <li>└── src/routes/ - File-based routing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
