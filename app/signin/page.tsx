import SessionStates from '@/components/session-states';
import { SignInForm } from './signin-form';

export default function SignIn() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <SessionStates />
      <SignInForm />
    </main>
  );
}