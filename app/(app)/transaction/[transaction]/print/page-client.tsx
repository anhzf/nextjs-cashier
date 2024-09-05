'use client';

import type { getTransaction } from '@/calls/transactions';
import { Button } from '@/components/ui/button';
import { TRANSACTION_STATUSES_UI } from '@/ui';
import { priceFormatter } from '@/utils/format';
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Roboto_Mono } from 'next/font/google';
import { ButtonBack } from '@/components/button-back';

interface PageClientProps {
  data: Awaited<ReturnType<typeof getTransaction>>;
}

const font = Roboto_Mono({ display: 'swap', subsets: ['latin'] });

export default function TransactionPrintViewPageClient({ data }: PageClientProps) {
  const total = data.items.reduce((acc, item) => acc + item.qty * item.price, 0);

  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => contentRef.current });

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex gap-2">
        <Button asChild variant="outline" size="icon">
          <ButtonBack>
            <ArrowLeftIcon className="size-6" />
          </ButtonBack>
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="grow"
          onClick={handlePrint}
        >
          <PrinterIcon className="size-4 mr-2" />
          Print
        </Button>
      </div>

      <main
        ref={contentRef}
        className={`bg-white p-4 sm:p-6 w-full max-w-[8.5in] mx-auto border print:border-none flex flex-col gap-4 ${font.className}`}
      >
        <div className="flex items-center justify-between">
          <img src="/icon.svg" alt="Logo" className="size-8" />

          <div className="text-left">
            <div className="font-bold text-lg">Invoice #{data.id}</div>
            <div className="text-sm text-muted-foreground">Tgl: {data.createdAt.toLocaleDateString('id')}</div>
          </div>
        </div>
        <div className="flex flex-col">
          <h3>
            <span className="font-bold text-sm mb-1">Kustomer: </span>
            <span className="text-sm">{data.customer?.name || '-'}</span>
          </h3>
          <h3 className="">
            <span className="font-bold text-sm mb-1">Status: </span>
            <span className="text-sm">{TRANSACTION_STATUSES_UI[data.status].title}</span>
          </h3>
          <h3>
            <span className="font-bold text-sm mb-1">Tenggat Waktu:</span>
            <span className="text-sm">{data.dueDate?.toLocaleDateString('id') || '-'}</span>
          </h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2 text-sm font-bold">No. </th>
              <th className="text-left pb-2 text-sm font-bold">Barang</th>
              <th className="text-right pb-2 text-sm font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={item.id} className="border-b">
                <td className="py-2 text-sm">{i + 1}.</td>
                <td className="py-2 text-sm" colSpan={2}>
                  <div>{item.product.name}</div>
                  <div className="text-sm flex justify-between">
                    <div>x{item.qty} {item.product.unit}</div>
                    <div>{item.price.toLocaleString('id')}</div>
                    <div className="">
                      = {(item.qty * item.price).toLocaleString('id')}
                    </div>
                  </div>
                </td>
              </tr>)
            )}
          </tbody>
        </table>
        <div className="mt-4 text-right">
          <div className="font-bold text-lg">
            Total: {priceFormatter.format(total)}
          </div>
        </div>
      </main>
    </div>
  );
}