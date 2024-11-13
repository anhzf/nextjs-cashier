'use client';

import { transactionApi } from '@/client/calls';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import type { InferOutput } from 'valibot';
import { utils as XLSXUtils, writeFile } from 'xlsx';
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
        status: query?.status === '$all' ? undefined : query?.status,
        includes: ['customer', 'items'],
      });

      const worksheet = XLSXUtils.json_to_sheet(data);
      const workbook = XLSXUtils.book_new();

      XLSXUtils.book_append_sheet(workbook, worksheet, 'Transaksi');

      writeFile(workbook, 'transaksi.xlsx');
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