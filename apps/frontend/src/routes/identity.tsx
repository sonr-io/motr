import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/identity')({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Identity Management</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your decentralized identity and cryptographic keys
          </p>
        </header>

        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Identity management features coming soon...</p>
        </div>
      </div>
    </div>
  );
}
