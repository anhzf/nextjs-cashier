import { listTransaction } from '@/calls/transactions';

export default async function Home() {
  const transactions = await listTransaction();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <pre className="whitespace-pre">
        {JSON.stringify(transactions, null, 2)}
      </pre>
    </main>
  );
}
