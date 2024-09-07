'use client';

import { transactionApi } from '@/client/calls';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Button } from '@/components/ui/button';
import { stringify } from 'csv-stringify/browser/esm/sync';
import { useTransition } from 'react';
import type { InferOutput } from 'valibot';
import type { QuerySchema } from './shared';

interface ExportCsvButtonProps extends React.ComponentProps<typeof Button> {
  query?: InferOutput<typeof QuerySchema>;
}

// TODO: Flatten expanded data
export function ExportCsvButton({ query, className, onClick: _onClick, ...props }: ExportCsvButtonProps) {
  const [isLoading, startLoading] = useTransition();
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (ev) => {
    startLoading(async () => {
      _onClick?.(ev);

      const data = await transactionApi.list({
        ...query,
        includes: ['customer', 'items'],
      });

      const csv = stringify(data, { header: true, delimiter: ';' });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'transaksi.csv';
      a.click();

      URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Ekspor"
        type="button"
        onClick={onClick}
        {...props}
      />

      {isLoading && (<LoadingOverlay fixed />)}
    </>
  );
}