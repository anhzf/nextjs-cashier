import { addItemsToTransaction, getTransaction, updateTransaction } from '@/calls/transactions';
import { AppBar } from '@/components/app-bar';
import { TransactionForm, type TransactionFieldValues, type TransactionFormAction } from '@/components/transaction-form';
import { Button } from '@/components/ui/button';
import { TRANSACTION_STATUSES } from '@/constants';
import { revalidatePath } from 'next/cache';
import * as v from 'valibot';

interface PageProps {
  params: {
    transaction: string;
  };
}

const createAction = (id: number, before: TransactionFieldValues): TransactionFormAction => (
  async ({ status, dueDate, items, paid }) => {
    'use server';

    // Ensure that we're only updating the fields that have changed
    const updates: Promise<any>[] = [];

    if (before?.status !== status) {
      const value = v.parse(v.picklist(TRANSACTION_STATUSES), status);
      updates.push(updateTransaction(id, { status: value, dueDate, paid }));
    }

    /* TODO: Use 'just-diff'.diff() to find the item updates */
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

    revalidatePath('/');
  }
);

export default async function TransactionViewPage({ params }: PageProps) {
  const transactionId = Number(params.transaction);
  const [
    data
  ] = await Promise.all([
    getTransaction(transactionId),
  ]);
  const fieldValues: TransactionFieldValues = {
    customerId: data.customer?.id,
    status: data.status,
    items: data.items.map((item) => ({
      productId: String(item.product.id),
      variant: item.variant,
      qty: item.qty,
    })),
    paid: data.paid,
    dueDate: data.dueDate ?? undefined,
  };

  return (
    <div className="relative h-screen flex flex-col">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Transaksi #{data.code ?? transactionId}
          </h1>
        </div>

        {fieldValues.status !== 'completed' && (
          <Button type="submit" form={`transaction/${transactionId}`}>
            Simpan
          </Button>
        )}
      </AppBar>

      <main className="container relative flex flex-col p-0">
        <TransactionForm
          formId={`transaction/${transactionId}`}
          fields={{
            customer: (fieldValues.customerId !== undefined) && 'readonly',
            status: fieldValues.status === 'completed' && 'readonly',
            items: fieldValues.status === 'completed' && 'readonly',
          }}
          values={fieldValues}
          action={createAction(transactionId, fieldValues)}
        />
      </main>
    </div>
  );
}