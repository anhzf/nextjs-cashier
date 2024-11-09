'use client';

import { LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY } from '@/calls/transactions';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRANSACTION_STATUSES } from '@/constants';
import { ListFilterIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { InferOutput } from 'valibot';
import type { QuerySchema } from './shared';
import { TRANSACTION_STATUSES_UI } from '@/ui';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SORT_BY_ATTRS = {
  createdAt: {
    title: 'Tanggal',
  },
  updatedAt: {
    title: 'Terakhir diubah',
  },
} satisfies Record<typeof LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY[number], Record<string, unknown>>;

type FilterBarProps = InferOutput<typeof QuerySchema>;

const dateToQuery = (date: Date) => date.toISOString().split('T')[0];

export function FilterBar({ from, to, sortBy = 'createdAt', status }: FilterBarProps) {
  const router = useRouter();

  const searchParams = new URLSearchParams();
  if (from) searchParams.append('from', dateToQuery(from));
  if (to) searchParams.append('to', dateToQuery(to));
  if (sortBy) searchParams.append('sortBy', sortBy);
  if (status) searchParams.append('status', status);

  const onStatusChange = (status: string) => {
    if (status && status !== 'all') searchParams.set('status', status);
    else searchParams.delete('status');
    router.push(`?${searchParams}`);
  };

  const onSortByChange = (sortBy: string) => {
    if (sortBy) searchParams.set('sortBy', sortBy);
    else searchParams.delete('sortBy');
    router.push(`?${searchParams}`);
  }

  const onFromChange = (value?: Date) => {
    if (value) searchParams.set('from', dateToQuery(value));
    else searchParams.delete('from');
    router.push(`?${searchParams}`);
  };

  const onToChange = (value?: Date) => {
    if (value) searchParams.set('to', dateToQuery(value));
    else searchParams.delete('to');
    router.push(`?${searchParams}`);
  };

  return (
    <div className="sticky top-16 z-10 flex bg-gray-50 items-center gap-x-6 gap-y-2 flex-wrap px-4 py-2.5 border-b">
      <ListFilterIcon className="size-4" />

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Status:
        </Label>

        <Select defaultValue={status || 'all'} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {TRANSACTION_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                <Badge className={TRANSACTION_STATUSES_UI[status].classes}>
                  {TRANSACTION_STATUSES_UI[status].title}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Urut berdasarkan:
        </Label>

        <Select defaultValue={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Urut berdasarkan" />
          </SelectTrigger>
          <SelectContent>
            {LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY.map((el) => (
              <SelectItem key={el} value={el}>
                {SORT_BY_ATTRS[el].title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* <Separator orientation="vertical" /> */}

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Mulai:
        </Label>

        <DatePicker
          placeholder="Pilih Tanggal"
          value={from}
          onValueChange={onFromChange}
        />

        {from && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onFromChange()}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-gray-500">
          Sampai:
        </Label>

        <DatePicker
          placeholder="Pilih Tanggal"
          value={to}
          onValueChange={onToChange}
        />

        {to && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onToChange()}>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
