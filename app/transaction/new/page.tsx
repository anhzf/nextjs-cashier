import { auth } from '@/auth';
import { createTransaction } from '@/calls/transactions';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { Button } from '@/components/ui/button';
import { ROUTE_SESSION_FAILED, TRANSACTION_STATUSES } from '@/constants';
import { revalidatePath } from 'next/cache';
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
    })).filter((item) => item.qty > 0),
    dueDate: values.dueDate ?? undefined,
    paid: values.paid,
  } satisfies v.InferInput<typeof PayloadSchema>));

  revalidatePath('/');
  return redirect('/');
};

export default async function TransactionNewPage() {
  return (
    <main className="container relative h-screen flex flex-col p-0">
      <div className="flex justify-between items-center gap-4 p-4">
        <h1 className="text-2xl font-bold">
          Buat transaksi baru
        </h1>

        <Button type="submit" form="transaction/new">
          Simpan
        </Button>
      </div>

      <TransactionForm
        formId="transaction/new"
        action={action}
        className="flex-1"
      />
    </main>
  );
}