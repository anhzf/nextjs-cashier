'use client';

import { AppDrawerContext } from '@/components/app-drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/ui';
import { MenuIcon } from 'lucide-react';
import { useContext, type ComponentProps } from 'react';

interface AppBarProps extends ComponentProps<'header'> {
  showMenu?: boolean;
  children?: React.ReactNode;
}

export function AppBar({ children, showMenu = true, className, ...props }: AppBarProps) {
  const appDrawer = useContext(AppDrawerContext);

  return (
    <header className={cn('sticky top-0 z-20 max-w-full bg-white shadow', className)} {...props}>
      <div className="flex items-center justify-between h-16 px-2 lg:px-4 gap-4">
        {showMenu && (
          <div className="lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => appDrawer?.setIsOpen((st) => !st)}
            >
              <MenuIcon />
            </Button>
          </div>
        )}

        {children}
      </div>
    </header>
  );
}

export function AppBarTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-xl font-bold line-clamp-1">
      {children}
    </h1>
  );
}