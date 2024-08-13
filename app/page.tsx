import { listTransaction } from '@/calls/transactions';
import { HomePageClient } from './page-client';

export default async function HomePage() {
  const [
    transactions,
  ] = await Promise.all([
    listTransaction({
      status: 'pending',
    }),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <HomePageClient
        transactions={transactions}
      />
    </main>
  );
}