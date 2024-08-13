import AppProviders from '@/app/providers';
import { auth } from '@/auth';
import { cn } from '@/utils/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppDrawer } from '@/components/app-drawer';
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

  return (
    <html lang="id">
      <body className={cn(inter.className, 'flex min-h-screen')}>
        <AppProviders session={session}>
          <AppDrawer />

          {children}
        </AppProviders>
      </body>
    </html>
  );
}
