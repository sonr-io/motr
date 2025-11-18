import { createFileRoute } from '@tanstack/react-router';
import { RegisterFlow } from '../components/RegisterFlow';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterFlow />
      </div>
    </div>
  );
}
