import { getSummaryOfTransactionsTotalAndCount } from '@/calls/summary/transactions-count';
import { listTransaction } from '@/calls/transactions';
import { AppBar } from '@/components/app-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TRANSACTION_STATUSES_UI } from '@/ui';
import defu from 'defu';
import { Edit2Icon, FileSpreadsheetIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import * as v from 'valibot';
import { ExportCsvButton } from './export-csv-button';
import { FilterBar } from './filter-bar';
import { PaginationBar } from './pagination-bar';
import { QuerySchema } from './shared';

const DEFAULT_LIST_TRANSACTION_QUERY = {
  status: 'pending',
} satisfies v.InferOutput<typeof QuerySchema>;

interface PageProps {
  searchParams: Record<string, string | string[]>;
}

export default async function TransactionListPage({ searchParams }: PageProps) {
  const _query = v.parse(v.objectWithRest(QuerySchema.entries, v.string()), searchParams);
  const query: v.InferOutput<typeof QuerySchema> = defu(_query, DEFAULT_LIST_TRANSACTION_QUERY);
  const summary = await getSummaryOfTransactionsTotalAndCount({
    start: query.from,
    end: query.to,
    status: query.status === '$all' ? undefined : query.status,
  });

  return (
    <div className="relative h-screen flex flex-col overflow-y-auto">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Daftar Transaksi
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ExportCsvButton query={_query}>
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

      <main className="container relative flex flex-col gap-4 px-0 pt-4">
        <div className="px-2">
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
        </div>

        <PaginationBar
          total={summary.count}
        />
      </main>
    </div>
  );
}

type TransactionListProps = v.InferOutput<typeof QuerySchema>;

async function TransactionList({ from, to, status, ...query }: TransactionListProps) {
  const data = await listTransaction({
    ...query,
    status: status === '$all' ? undefined : status,
    range: [from, to],
    includes: ['customer'],
    limit: Infinity,
  });

  return (
    <div className="">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              #
            </TableHead>
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
          {data.map((transaction, i) => (
            <TableRow key={transaction.id}>
              <TableCell className="w-[4ch] text-muted-foreground">
                {i + 1}
              </TableCell>
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