import { getTransaction } from '@/calls/transactions';

interface PageProps {
  params: {
    transaction: string;
  };
}

export default async function TransactionViewPage({ params }: PageProps) {
  const [
    data
  ] = await Promise.all([
    getTransaction(Number(params.transaction)),
  ]);

  return (
    <main>
      <pre className="whitespace pre">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}