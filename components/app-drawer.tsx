'use client';

import SessionStates from '@/components/session-states';
import { cn } from '@/utils/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/', label: 'Dasbor' },
  { href: '/product', label: 'Produk' },
];

export function AppDrawer() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-64 bg-white text-gray-700 border-r overflow-hidden">
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
  )
}