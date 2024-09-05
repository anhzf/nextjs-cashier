import { listProduct } from '@/calls/products';
import { getSummaryOfTransactionsTotalAndCount as _getSummaryOfTransactionsTotalAndCount } from '@/calls/summary/transactions-count';
import { listTransaction } from '@/calls/transactions';
import { AppBar } from '@/components/app-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PRODUCT_STOCK_ALERT_THRESHOLD } from '@/constants';
import { db } from '@/db';
import { products, transactionItems, transactions } from '@/db/schema';
import { priceFormatter } from '@/utils/format';
import { endOfWeek, startOfWeek } from 'date-fns';
import { count, eq, inArray, lte, sql } from 'drizzle-orm';
import { AlertTriangleIcon, ArrowUpRight, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { cache, Suspense } from 'react';

const getSummaryOfTransactionsTotalAndCount = cache(_getSummaryOfTransactionsTotalAndCount);

const now = new Date();

export default async function HomePage() {
  const summaryDateRange: [Date, Date] = [
    startOfWeek(now),
    endOfWeek(now),
  ];

  return (
    <div className="relative h-screen flex flex-col">
      <AppBar className="lg:hidden" />

      <main className="container relative flex flex-col gap-4 p-4 px-2 md:px-4">
        <div className="grow flex flex-col md:flex-row justify-between gap-2 flex-wrap py-4 md:pb-2">
          <h1 className="text-2xl font-semibold">
            Dasbor
          </h1>

          <div className="flex gap-2">
            <DatePickerWithRange value={summaryDateRange} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Suspense fallback={
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Pendapatan
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardContent>
            </Card>
          }>
            <RevenueCard range={summaryDateRange} />
          </Suspense>

          <Suspense fallback={
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Hutang
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </CardContent>
            </Card>
          }>
            <DebtCard range={summaryDateRange} />
          </Suspense>

          <Card className="hidden md:flex opacity-40 min-h-24 flex-col justify-center">
            <div className="text-3xl font-bold text-center">
              COMING SOON
            </div>
          </Card>

          <Card className="hidden md:flex opacity-40 min-h-24 flex-col justify-center">
            <div className="text-3xl font-bold text-center">
              COMING SOON
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Suspense fallback={(
            <Card className="xl:col-span-2">
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle className="flex items-center gap-2">
                    Hutang <Skeleton className="h-6 w-[2.5ch] rounded-full" />
                  </CardTitle>
                  <CardDescription>
                    Transaksi yang belum dibayar
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="ml-auto gap-1">
                  <Link href={{ pathname: '/transaction', query: { status: 'pending' } }}>
                    Lihat semua
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kustomer</TableHead>
                      <TableHead>
                        Tenggat Pembayaran
                      </TableHead>
                      <TableHead>
                        Kekurangan
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="p-3">
                          <div className="font-medium">
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </TableCell>
                        <TableCell className="p-3 text-sm">
                          <Skeleton className="h-3 w-1/2" />
                        </TableCell>
                        <TableCell className="p-3 text-right">
                          <Skeleton className="h-3 w-[10ch]" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}>
            <DebtorCard />
          </Suspense>

          <Suspense fallback={(
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="inline-block text-amber-500" />
                  Peringatan Stok
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-8">
                <Table>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="w-full p-2 text-sm font-medium leading-none">
                          <div className="line-clamp-1 max-w-[28ch]">
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </TableCell>
                        <TableCell className="p-2 text-right">
                          <Skeleton className="h-3 w-[6ch]" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button asChild variant="link" size="sm">
                  <Link href={{ pathname: 'product', query: { orderBy: 'stock' } }}
                    className="text-sm text-muted-foreground"
                  >
                    Lihat 5 barang lainnya
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}>
            <StockAlertCard />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

interface SummaryCardProps {
  range: readonly [Date, Date];
}

async function RevenueCard({ range: [start, end] }: SummaryCardProps) {
  const { total, count } = await _getSummaryOfTransactionsTotalAndCount({
    status: 'completed',
    start,
    end,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Pendapatan
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {priceFormatter.format(total)}
        </div>
        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
        <p className="text-xs text-muted-foreground">
          dari {count} transaksi
        </p>
      </CardContent>
    </Card>
  );
}

async function DebtCard({ range: [start, end] }: SummaryCardProps) {
  const { total, count } = await getSummaryOfTransactionsTotalAndCount({
    status: 'pending',
    start,
    end,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Hutang
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {priceFormatter.format(total)}
        </div>
        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
        <p className="text-xs text-muted-foreground">
          dari {count} transaksi
        </p>
      </CardContent>
    </Card>
  );
}

async function DebtorCard() {
  const [
    { count },
    transactions,
  ] = await Promise.all([
    getSummaryOfTransactionsTotalAndCount({ status: 'pending' }),
    listTransaction({
      status: 'pending',
      sortBy: 'createdAt',
      sort: 'desc',
      limit: 5,
      includes: ['customer'],
    }),
  ]);

  return (
    <Card className="xl:col-span-2 h-min min-h-72">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="flex items-center gap-2">
            Hutang <Badge>{count}</Badge>
          </CardTitle>
          <CardDescription>
            Transaksi yang belum dibayar
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="ml-auto gap-1">
          <Link href={{ pathname: '/transaction', query: { status: 'pending' } }}>
            Lihat semua
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Kustomer
              </TableHead>
              <TableHead className="text-center">
                Tenggat Pembayaran
              </TableHead>
              <TableHead className="text-right">
                Kekurangan
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length
              ? transactions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-3">
                    <div className="font-medium">{item.customer?.name || 'Tanpa Nama'}</div>
                  </TableCell>
                  <TableCell className="p-3 text-sm text-center">
                    {item.dueDate?.toLocaleDateString() || '-'}
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    <Suspense fallback={(
                      <Skeleton className="h-3 w-[10ch] ml-auto" />
                    )}>
                      <PaidMinusCellContent
                        ids={transactions.map((el) => el.id)}
                        transactionId={item.id}
                      />
                    </Suspense>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/transaction/${item.id}`}
                      className="text-blue-500 hover:text-blue-400 font-medium underline underline-offset-4"
                    >
                      Detail
                    </Link>
                  </TableCell>
                </TableRow>
              ))
              : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    Yeayy! Tidak ada hutang 🎉
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Use this convention for caching functions, make sure to use the same arguments too.
const getPaidMinusDebt = cache(async (...transactionIds: number[]) => {
  const results = await db.select({
    id: transactions.id,
    minus: sql<number>`COALESCE(SUM(${transactionItems.qty} * ${transactionItems.price}), 0) - ${transactions.paid}`,
  })
    .from(transactions)
    .leftJoin(transactionItems, eq(transactions.id, transactionItems.transactionId))
    .where(inArray(transactions.id, transactionIds))
    .groupBy(transactions.id);

  return results;
});

async function PaidMinusCellContent({ ids, transactionId }: { ids: number[], transactionId: number }) {
  const results = await getPaidMinusDebt(...ids);
  const minus = results.find((result) => result.id === transactionId)?.minus || 0;

  return (
    <div className="text-red-500">
      {priceFormatter.format(minus)}
    </div>
  );
}

async function StockAlertCard() {
  const [
    items,
    [{ count: alertCount }],
  ] = await Promise.all([
    listProduct({
      sortBy: 'stock',
      limit: 5,
    }),
    // TODO: Move this to a separate function
    db.select({ count: count() })
      .from(products)
      .where(lte(products.stock, PRODUCT_STOCK_ALERT_THRESHOLD)),
  ]);

  return (
    <Card className="h-min">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="inline-block text-amber-500" />
          Peringatan Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8">
        <Table>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-2 text-sm font-medium leading-none">
                  <div className="line-clamp-1 max-w-[28ch]">
                    {item.name}
                  </div>
                </TableCell>
                <TableCell className="p-2 text-right">
                  <Badge variant="outline" className="text-red-400">
                    {item.stock ? `${item.stock} tersisa` : 'Kosong'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button asChild variant="link" size="sm">
          <Link href={{ pathname: 'product', query: { orderBy: 'stock' } }} className="text-sm text-muted-foreground">
            Lihat {alertCount - items.length} barang lainnya
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}