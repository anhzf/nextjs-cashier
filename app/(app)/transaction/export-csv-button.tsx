'use client';

import { Button } from '@/components/ui/button';
import { stringify } from 'csv-stringify/browser/esm/sync';
import { forwardRef } from 'react';

interface ExportCsvButtonProps extends React.ComponentProps<typeof Button> {
  data: Record<string, any>[];
}

export const ExportCsvButton = forwardRef<HTMLButtonElement, ExportCsvButtonProps>(
  function ExportCsvButton({ data, className, onClick: _onClick, ...props }, ref) {
    const onClick: React.MouseEventHandler<HTMLButtonElement> = async (ev) => {
      _onClick?.(ev);

      const csv = stringify(data, { header: true });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'transaksi.csv';
      a.click();

      URL.revokeObjectURL(url);
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Ekspor"
        ref={ref}
        type="button"
        onClick={onClick}
        {...props}
      />
    );
  }
);