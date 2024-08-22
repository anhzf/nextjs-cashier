import { addItemsToTransaction, getTransaction, updateTransaction } from '@/calls/transactions';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { TRANSACTION_STATUSES } from '@/constants';
import * as v from 'valibot';

interface PageProps {
  params: {
    transaction: string;
  };
}

const createAction = (id: number): TransactionFormAction => (
  async ({ status, dueDate, items }, before) => {
    'use server';

    // Ensure that we're only updating the fields that have changed
    const updates: Promise<any>[] = [];

    if (before?.status !== status) {
      const value = v.parse(v.picklist(TRANSACTION_STATUSES), status);
      updates.push(updateTransaction(id, { status: value, dueDate }));
    }

    const hasItemsChange = items.length !== before?.items.length
      || items.some((item, index) => (
        item.productId !== before.items[index].productId
        || item.variant !== before.items[index].variant
        || item.qty !== before.items[index].qty
      ));

    if (hasItemsChange) {
      updates.push(addItemsToTransaction(id, items.map((item) => ({
        productId: Number(item.productId),
        variant: item.variant,
        qty: item.qty,
      }))));
    }

    await Promise.all(updates);
  }
);

export default async function TransactionViewPage({ params }: PageProps) {
  const transactionId = Number(params.transaction);
  const [
    data
  ] = await Promise.all([
    getTransaction(transactionId),
  ]);

  return (
    <main className="p-4">
      <h1 className="text-3xl">
        Transaksi #{data.code ?? transactionId}
      </h1>

      <div>
        Dibuat pada: {data.createdAt.toLocaleString('id')}
      </div>
      <div>
        Diperbarui pada: {data.updatedAt.toLocaleString('id')}
      </div>

      <TransactionForm
        editable={{
          customerId: false,
          status: true,
          items: true,
        }}
        values={{
          customerId: data.customer?.id ?? NaN,
          status: data.status,
          items: data.items.map((item) => ({
            productId: String(item.product.id),
            variant: item.variant,
            qty: item.qty,
          })),
        }}
        action={createAction(transactionId)}
      />
    </main>
  );
}