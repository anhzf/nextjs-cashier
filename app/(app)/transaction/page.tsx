import { ExportCsvButton } from '@/app/(app)/transaction/export-csv-button';
import { listTransaction } from '@/calls/transactions';
import { AppBar } from '@/components/app-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TRANSACTION_STATUSES_UI } from '@/ui';
import { Edit2Icon, FileSpreadsheetIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import * as v from 'valibot';
import { FilterBar } from './filter-bar';
import { QuerySchema } from './shared';

interface PageProps {
  searchParams: Record<string, string | string[]>;
}

export default async function TransactionListPage({ searchParams }: PageProps) {
  const query = v.parse(v.objectWithRest(QuerySchema.entries, v.string()), searchParams);

  return (
    <div className="relative h-screen flex flex-col">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Daftar Transaksi
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ExportCsvButton query={query}>
            <FileSpreadsheetIcon className="size-6" />
          </ExportCsvButton>

          <Button asChild aria-label="Transaksi Baru">
            <Link href="/transaction/new">
              <PlusIcon className="size-4 mr-1" />
              Transaksi
            </Link>
          </Button>
        </div>
      </AppBar>

      <FilterBar {...query} />

      <main className="container relative flex flex-col gap-4 px-2 py-4">
        <Suspense fallback={(
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Tanggal
                </TableHead>
                <TableHead>
                  Kustomer
                </TableHead>
                <TableHead className="text-center">
                  Status
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}>
          <TransactionList {...query} />
        </Suspense>
      </main>
    </div>
  );
}

type TransactionListProps = v.InferOutput<typeof QuerySchema>;

async function TransactionList({ from, to, ...query }: TransactionListProps) {
  const data = await listTransaction({
    ...query,
    range: [from, to],
    includes: ['customer'],
  });

  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Tanggal
            </TableHead>
            <TableHead>
              Kustomer
            </TableHead>
            <TableHead className="text-center">
              Status
            </TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-gray-500">
                {transaction.createdAt.toLocaleString('id').replaceAll('.', ':')}
              </TableCell>
              <TableCell>
                {transaction.customer?.name || '-'}
              </TableCell>
              <TableCell className="text-center">
                <Badge className={`cursor-default ${TRANSACTION_STATUSES_UI[transaction.status].classes}`}>
                  {TRANSACTION_STATUSES_UI[transaction.status].title}
                </Badge>
              </TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/transaction/${transaction.id}`}>
                    <Edit2Icon className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}