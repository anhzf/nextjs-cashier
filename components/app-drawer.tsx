'use client';

import SessionStates from '@/components/session-states';
import { cn } from '@/utils/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, type Dispatch, type MouseEventHandler, type SetStateAction } from 'react';

const MENU = [
  { href: '/', label: 'Dasbor' },
  { href: '/transaction', label: 'Transaksi' },
  { href: '/product', label: 'Produk' },
];

interface AppDrawerContext {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const AppDrawerContext = createContext<AppDrawerContext | null>(null);

export function AppDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AppDrawerContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </AppDrawerContext.Provider>
  )
}

export function AppDrawer() {
  const ctx = useContext(AppDrawerContext);
  if (!ctx) throw new Error('AppDrawer must be used within AppDrawerProvider');

  const pathname = usePathname();

  const { isOpen, setIsOpen } = ctx;

  const onOverlayClick: MouseEventHandler<HTMLElement> = (e) => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-gray-700/50" onClick={onOverlayClick} />}

      <nav
        className={cn(
          'shrink-0 fixed lg:static inset-y-0 left-0 flex w-64 flex-col bg-white text-gray-700 border-r shadow-xl lg:shadow-none overflow-hidden z-10 lg:translate-x-0 transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >

        {MENU.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn('p-4 hover:bg-gray-100 active:bg-gray-200', {
              'bg-gray-100': href === pathname,
            })}
          >
            {label}
          </Link>
        ))}

        <SessionStates />
      </nav>
    </>
  );
}