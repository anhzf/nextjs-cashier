'use client';

import SessionStates from '@/components/session-states';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui';
import { LayoutDashboardIcon, PackageIcon, ShoppingCartIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, type Dispatch, type MouseEventHandler, type SetStateAction } from 'react';

const MENU = [
  { href: '/', label: 'Dasbor', icon: LayoutDashboardIcon },
  { href: '/transaction', label: 'Transaksi', icon: ShoppingCartIcon },
  { href: '/product', label: 'Produk', icon: PackageIcon },
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

  const session = useSession();

  const pathname = usePathname();

  const { isOpen, setIsOpen } = ctx;

  const onOverlayClick: MouseEventHandler<HTMLElement> = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && <div className="fixed z-20 inset-0 bg-gray-700/50" onClick={onOverlayClick} />}

      <nav
        className={cn(
          'shrink-0 fixed lg:static z-20 inset-y-0 left-0 flex w-64 flex-col bg-white text-gray-700 border-r shadow-xl lg:shadow-none overflow-hidden lg:translate-x-0 transition-transform',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Menu
            </h2>
            <div className="flex flex-col gap-1">
              {MENU.map((item) => (
                <Button
                  asChild
                  key={item.label}
                  variant="ghost"
                  className={cn('w-full justify-start', {
                    'bg-gray-100': item.href === pathname,
                  })}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-4">
          <Avatar>
            <AvatarFallback>
              {session.data?.user?.name?.at(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {session.data?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {session.data?.user?.email}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}