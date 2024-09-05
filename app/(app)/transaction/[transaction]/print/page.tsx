import { getTransaction } from '@/calls/transactions';
import TransactionPrintViewPageClient from './page-client';

interface PageProps {
  params: {
    transaction: string;
  };
}

export default async function TransactionPrintViewPage({ params }: PageProps) {
  const transaction = await getTransaction(Number(params.transaction));

  return (
    <TransactionPrintViewPageClient data={transaction} />
  );
}