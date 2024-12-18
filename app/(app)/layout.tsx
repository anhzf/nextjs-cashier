import { auth, signIn } from '@/auth';
import { AppDrawer } from '@/components/app-drawer';
import { cn } from '@/utils/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppProviders from './providers';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Transaction Recorder',
  description: 'Generated by create next app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) return signIn();

  return (
    <html lang="id">
      <body className={cn(inter.className, 'flex min-h-screen')}>
        <AppProviders session={session}>
          <AppDrawer />

          <div className="flex-1">
            {children}
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
