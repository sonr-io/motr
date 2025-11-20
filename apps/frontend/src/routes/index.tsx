import { createFileRoute, Link } from '@tanstack/react-router';
import { AccountInfo } from '../components/AccountInfo';
import { BalanceInfo } from '../components/BalanceInfo';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Motr Frontend</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Secure WebAssembly-based cryptographic operations and decentralized identity
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with TanStack Start, React, and WebAssembly
          </p>
        </header>

        <nav className="flex justify-center space-x-6">
          <Link
            to="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Register
          </Link>
          <Link
            to="/payment"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Payment Demo
          </Link>
          <Link
            to="/search"
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Blockchain Explorer
          </Link>
          <Link
            to="/identity"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Identity Management
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-6">
          <AccountInfo />
          <BalanceInfo />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                WebAuthn Passkeys
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Secure, phishing-resistant authentication using hardware-backed passkeys
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                WebAssembly Crypto
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                High-performance cryptographic operations running in WebAssembly
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Multi-Chain Support
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Native support for Cosmos, Ethereum, Solana, and Bitcoin networks
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                UCAN Authorization
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Decentralized authorization with capability-based access control
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">MPC Operations</h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                Multi-party computation for enhanced cryptographic security
              </p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Service Workers
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                Background processing and offline capabilities for payments
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Migrated from apps/web with enhanced authentication and blockchain features</p>
        </div>
      </div>
    </div>
  );
}
