'use client';

import { AppDrawerProvider } from '@/components/app-drawer';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Props {
  children?: React.ReactNode;
  session?: Session | null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export default function AppProviders({ session, children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <AppDrawerProvider>
          {children}
        </AppDrawerProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}