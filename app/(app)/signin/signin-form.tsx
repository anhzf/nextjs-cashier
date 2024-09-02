'use client';

import { useLoading } from '@/hooks/use-loading';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import * as v from 'valibot';

const REDIRECT_SUCCESS = '/';

const PayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
});

// TODO: Optimize the submit action. The signIn() is call at least three endpoints (Provider, CSRF, and Session).
// This is resolvable by using the signIn() from the @/auth module.
export function SignInForm() {
  const router = useRouter();
  const [isLoading, loading] = useLoading();
  const [errors, setErrors] = useState<string[]>([]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
    e.preventDefault();

    const { success, issues, output: payload } = v.safeParse(PayloadSchema, Object.fromEntries(new FormData(e.currentTarget)));

    if (!success) {
      setErrors(issues.map((issue) => issue.message));
      return;
    }

    try {
      const res = await loading(signIn('credentials', {
        ...payload,
        redirect: false,
      }));

      if (res?.error) {
        console.error(res);
        setErrors(['Invalid email or password']);
        return;
      }

      router.push(REDIRECT_SUCCESS);
    } catch (err) {
      setErrors(['Invalid email or password']);
    }
  }, [loading, router]);

  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <label>
        Email
        <input type="email" name="email" autoComplete="email" />
      </label>

      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" />
      </label>

      {errors.map(err => (
        <p key={err} className="text-red-500">{err}</p>
      ))}

      <button disabled={isLoading} type="submit">
        {isLoading ? 'Loading...' : 'Sign In'}
      </button>
    </form>
  );
}