'use client';

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

const QUERY_PARAMS_MAPPER = {
  // property -> query param name
  tag: 'tag',
  showHidden: 'showHidden',
}

interface FilterBarProps {
  availableTags: { id: number; name: string }[];
  query: {
    tag?: number;
    showHidden?: boolean;
  };
}

export function FilterBar({ availableTags, query }: FilterBarProps) {
  const router = useRouter();

  const searchParams = new URLSearchParams();
  if (query.tag) searchParams.append('tag', query.tag.toString());
  if (query.showHidden) searchParams.append('showHidden', query.showHidden.toString());

  const onTagChange = (status: string) => {
    if (status && status !== 'all') searchParams.set(QUERY_PARAMS_MAPPER.tag, status);
    else searchParams.delete(QUERY_PARAMS_MAPPER.tag);
    router.push(`?${searchParams}`);
  };

  const onShowHiddenChange = (checked: boolean) => {
    if (checked) searchParams.set(QUERY_PARAMS_MAPPER.showHidden, 'true');
    else searchParams.delete(QUERY_PARAMS_MAPPER.showHidden);
    router.push(`?${searchParams}`);
  };

  return (
    <div className="sticky top-16 z-10 flex bg-gray-50 px-4 py-2.5 items-center gap-x-6 gap-y-2 flex-wrap border-b">
      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Tag:
        </Label>
        <Select value={query.tag?.toString() || '$all'} onValueChange={onTagChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$all">
              Semua
            </SelectItem>
            {availableTags.map((el) => (
              <SelectItem key={el.id} value={el.id.toString()}>
                {el.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-hidden"
          checked={query.showHidden}
          onCheckedChange={onShowHiddenChange}
        />
        <Label htmlFor="show-hidden" className="text-muted-foreground">
          Tampilkan Produk Tersembunyi
        </Label>
      </div>
    </div>
  );
}