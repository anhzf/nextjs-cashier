import { listTransaction } from '@/calls/transactions';
import { TransactionListPageClient } from './page-client';

export default async function TransactionListPage() {
  const [
    transactions,
  ] = await Promise.all([
    listTransaction(),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <TransactionListPageClient
        transactions={transactions}
      />
    </main>
  );
}