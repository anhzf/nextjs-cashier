import { auth } from '@/auth';
import { createTransaction } from '@/calls/transactions';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { ROUTE_SESSION_FAILED, TRANSACTION_STATUSES } from '@/constants';
import { redirect } from 'next/navigation';
import * as v from 'valibot';

const action: TransactionFormAction = async (values) => {
  'use server';

  const session = await auth();

  if (!session?.user?.id) return redirect(ROUTE_SESSION_FAILED);

  const PayloadSchema = v.object({
    userId: v.number(),
    customerId: v.optional(v.number()),
    status: v.picklist(TRANSACTION_STATUSES),
    items: v.array(v.object({
      productId: v.number(),
      variant: v.string(),
      qty: v.number(),
    })),
    dueDate: v.optional(v.date()),
    paid: v.optional(v.number()),
  }, 'Invalid payload');

  await createTransaction(v.parse(PayloadSchema, {
    userId: Number(session.user.id),
    customerId: values.customerId,
    status: values.status as any,
    items: values.items.map((item) => ({
      productId: Number(item.productId),
      variant: item.variant,
      qty: Number(item.qty),
    })),
    dueDate: values.dueDate,
    paid: values.paid,
  } satisfies v.InferInput<typeof PayloadSchema>));

  return redirect('/');
};

export default async function TransactionViewPage() {
  return (
    <main className="p-4">
      <h1 className="text-3xl">
        Buat transaksi baru
      </h1>

      <TransactionForm
        action={action}
      />
    </main>
  );
}