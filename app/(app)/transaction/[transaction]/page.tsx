import { addItemsToTransaction, getTransaction, updateTransaction } from '@/calls/transactions';
import { AppBar } from '@/components/app-bar';
import { TransactionFieldValuesSchema, TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { Button } from '@/components/ui/button';
import { diff } from 'just-diff';
import { PrinterIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import * as v from 'valibot';

interface PageProps {
  params: {
    transaction: string;
  };
}

const createAction = (id: number, before: v.InferOutput<typeof TransactionFieldValuesSchema>): TransactionFormAction => (
  async ({ items, ...transaction }) => {
    'use server';

    // Ensure that we're only updating the fields that have changed
    const updates: Promise<any>[] = [];

    if (diff(before, transaction).length > 0) {
      updates.push(updateTransaction(id, transaction));
    }

    const hasItemsChange = diff(before.items, items).length > 0;

    if (hasItemsChange) {
      updates.push(addItemsToTransaction(id, items.map((item) => ({
        productId: Number(item.productId),
        variant: item.variant,
        qty: item.qty,
      }))));
    }

    await Promise.all(updates);

    revalidatePath('/');
    redirect('/transaction');
  }
);

export default async function TransactionViewPage({ params }: PageProps) {
  const transactionId = Number(params.transaction);
  const [
    data
  ] = await Promise.all([
    getTransaction(transactionId),
  ]);
  const fieldValues: v.InferInput<typeof TransactionFieldValuesSchema> = {
    customerId: data.customer?.id,
    status: data.status,
    items: data.items.map((item) => ({
      productId: String(item.product.id),
      variant: item.variant,
      qty: item.qty,
    })),
    paid: data.paid,
    dueDate: data.dueDate?.toISOString().split('T')[0],
  };

  return (
    <div className="relative h-screen flex flex-col overflow-auto">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Transaksi #{data.code ?? transactionId}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/transaction/${transactionId}/print`}>
              <PrinterIcon className="size-6" />
            </Link>
          </Button>

          {fieldValues.status !== 'completed' && (
            <Button type="submit" form={`transaction/${transactionId}`}>
              Simpan
            </Button>
          )}
        </div>
      </AppBar>

      <main className="container relative flex flex-col p-0">
        <TransactionForm
          formId={`transaction/${transactionId}`}
          fields={{
            items: fieldValues.status === 'completed' && 'readonly',
          }}
          values={fieldValues}
          action={createAction(transactionId, v.parse(TransactionFieldValuesSchema, fieldValues))}
        />
      </main>
    </div>
  );
}