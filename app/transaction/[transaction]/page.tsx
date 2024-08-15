import { addItemsToTransaction, getTransaction, updateTransaction, updateTransactionItem } from '@/calls/transactions';
import { TransactionForm, type TransactionFormAction, type TransactionFormItemAction } from '@/components/transaction-form';
import { TRANSACTION_STATUSES } from '@/constants';
import * as v from 'valibot';

interface PageProps {
  params: {
    transaction: string;
  };
}


export default async function TransactionViewPage({ params }: PageProps) {
  const transactionId = Number(params.transaction);
  const [
    data
  ] = await Promise.all([
    getTransaction(transactionId),
  ]);

  const action: TransactionFormAction = async ({ status, items }, before) => {
    'use server';

    const updates: Promise<any>[] = [];

    if (before?.status !== status) {
      const value = v.parse(v.picklist(TRANSACTION_STATUSES), status);
      updates.push(updateTransaction(transactionId, { status: value }));
    }

    const hasItemsChange = items.length !== before?.items.length
      || items.some((item, index) => (
        item.productId !== before.items[index].productId
        || item.variant !== before.items[index].variant
        || item.qty !== before.items[index].qty
      ));

    if (hasItemsChange) {
      updates.push(addItemsToTransaction(transactionId, items.map((item) => ({
        productId: Number(item.productId),
        variant: item.variant,
        qty: item.qty,
      }))));
    }

    await Promise.all(updates);
  };

  return (
    <main>
      <h1 className="text-3xl">
        Transaction
      </h1>

      <TransactionForm
        editable={{
          customerId: false,
          status: true,
          items: true,
        }}
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
      // itemAction={itemAction}
      />
    </main>
  );
}