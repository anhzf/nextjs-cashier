'use client';

import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';

type Value = ComponentProps<typeof DatePickerWithRange>['value'];

interface DashboardSummaryDateRangePickerProps {
  value?: Value;
}

export function DashboardSummaryDateRangePicker({
  value,
}: DashboardSummaryDateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onValueChange = (value: Value) => {
    const urlSearchParams = new URLSearchParams(searchParams.toString());
    if (value?.[0]) urlSearchParams.set('from', value?.[0]?.toISOString().split('T')[0]);
    if (value?.[1]) urlSearchParams.set('to', value?.[1]?.toISOString().split('T')[0]);

    router.replace(`?${urlSearchParams}`);
  };

  return (
    <DatePickerWithRange
      value={value}
      onValueChange={onValueChange}
    />
  );
}