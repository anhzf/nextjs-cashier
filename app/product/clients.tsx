'use client';

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation';

interface ProductListSwitchHiddenProps {
  query: {
    showHidden?: boolean;
  };
}

export function ProductListSwitchHidden({ query }: ProductListSwitchHiddenProps) {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="show-hidden"
        checked={query.showHidden}
        onCheckedChange={(checked) => {
          const url = new URL(window.location.href)
          if (checked) {
            url.searchParams.set('showHidden', 'true')
          } else {
            url.searchParams.delete('showHidden')
          }

          router.push(url.toString());
        }}
      />
      <Label htmlFor="show-hidden">Tampilkan Produk Tersembunyi</Label>
    </div>
  );
}