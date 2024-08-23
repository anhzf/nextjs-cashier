import { auth } from '@/auth';
import { createTransaction } from '@/calls/transactions';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { ROUTE_SESSION_FAILED } from '@/constants';
import { redirect } from 'next/navigation';
import * as v from 'valibot';

const action: TransactionFormAction = async (values) => {
  'use server';

  const session = await auth();

  if (!session?.user?.id) return redirect(ROUTE_SESSION_FAILED);

  const PayloadSchema = v.object({
    userId: v.number(),
    items: v.array(v.object({
      productId: v.number(),
      variant: v.string(),
      qty: v.number(),
    })),
  }, 'Invalid payload');

  await createTransaction({
    ...v.parse(PayloadSchema, {
      userId: Number(session.user.id),
      items: values.items.map((item) => ({
        productId: Number(item.productId),
        variant: item.variant,
        qty: Number(item.qty),
      })),
    } satisfies v.InferInput<typeof PayloadSchema>),
    isStocking: true,
  });

  return redirect('/');
};

export default async function StockNewPage() {
  return (
    <main className="p-4">
      <h1 className="text-3xl">
        Tambah stok barang
      </h1>

      <TransactionForm
        action={action}
        editable={{
          customerId: false,
          status: false,
          dueDate: false,
        }}
      />
    </main>
  );
}