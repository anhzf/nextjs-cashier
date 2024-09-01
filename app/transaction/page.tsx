import { listTransaction } from '@/calls/transactions';
import { TransactionListPageClient } from './page-client';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';

export default async function TransactionListPage() {
  const [
    transactions,
  ] = await Promise.all([
    listTransaction(),
  ]);

  return (
    <div className="relative h-screen flex flex-col">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Daftar Transaksi
          </h1>
        </div>

        <Button asChild variant="ghost" size="icon" aria-label="Transaksi Baru">
          <Link href="/transaction/new">
            <PlusIcon className="size-6" />
          </Link>
        </Button>
      </AppBar>

      <main className="container relative flex flex-col p-0">
        <TransactionListPageClient
          transactions={transactions}
        />
      </main>
    </div>
  );
}