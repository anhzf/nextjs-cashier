import { auth } from '@/auth';
import { createTransaction } from '@/calls/transactions';
import { AppBar } from '@/components/app-bar';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { Button } from '@/components/ui/button';
import { ROUTE_SESSION_FAILED, TRANSACTION_STATUSES } from '@/constants';
import { ArrowLeftIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
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
  return redirect('/transaction');
};

export default async function TransactionNewPage() {
  return (
    <div className="relative h-screen flex flex-col overflow-auto">
      <AppBar showMenu={false}>
        <div className="grow flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/transaction">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </Button>

          <h1 className="text-xl font-bold">
            Transaksi Baru
          </h1>
        </div>

        <Button type="submit" form="transaction/new">
          Simpan
        </Button>
      </AppBar>

      <main className="container relative flex flex-col p-0">
        <TransactionForm
          formId="transaction/new"
          action={action}
          className="flex-1"
        />
      </main>
    </div>
  );
}