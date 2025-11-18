import { createFileRoute } from '@tanstack/react-router';
import { IdentityManager } from '../components/IdentityManager';

export const Route = createFileRoute('/identity')({
  component: IdentityPage,
});

function IdentityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <IdentityManager />
      </div>
    </div>
  );
}
