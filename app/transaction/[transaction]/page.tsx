import { getTransaction, updateTransaction } from '@/calls/transactions';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';

interface PageProps {
  params: {
    transaction: string;
  };
}

const action: TransactionFormAction = async (values) => {
  'use server';

  // await updateTransaction();
};

export default async function TransactionViewPage({ params }: PageProps) {
  const [
    data
  ] = await Promise.all([
    getTransaction(Number(params.transaction)),
  ]);

  return (
    <main>
      <h1 className="text-3xl">
        Transaction
      </h1>

      <TransactionForm
        values={{
          customerId: String(data.customer?.id ?? ''),
          status: data.status,
          items: data.items.map((item) => ({
            productId: String(item.product.id),
            variant: item.variant,
            qty: item.qty,
          })),
        }}
        action={action}
      />
    </main>
  );
}