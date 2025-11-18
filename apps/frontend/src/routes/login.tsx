import { createFileRoute } from '@tanstack/react-router';
import { LoginFlow } from '../components/LoginFlow';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginFlow />
      </div>
    </div>
  );
}
