import { auth } from '@/auth';
import { createTransaction } from '@/calls/transactions';
import { AppBar, AppBarTitle } from '@/components/app-bar';
import { TransactionForm, type TransactionFormAction } from '@/components/transaction-form';
import { Button } from '@/components/ui/button';
import { ROUTE_SESSION_FAILED } from '@/constants';
import { PlusIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
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

  return redirect('/product');
};

export default async function StockNewPage({ searchParams }: { searchParams: Record<string, string> }) {
  const persistedValue = searchParams.values && JSON.parse(searchParams.values);

  return (
    <div className="relative h-screen max-w-[100vw] flex flex-col">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <AppBarTitle>Tambah Stok</AppBarTitle>

          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <Link href="/product/new">
                <PlusIcon className="mr-1 size-4" />
                Produk
              </Link>
            </Button>

            <Button type="submit" form="stock/new">
              <SaveIcon className="mr-1 size-4" />
              Simpan
            </Button>
          </div>
        </div>
      </AppBar>

      <main className="container relative flex flex-col gap-2 px-0">
        <TransactionForm
          formId="stock/new"
          action={action}
          stocking
          fields={{
            customer: false,
            status: false,
            dueDate: false,
            paid: false,
            summary: false,
          }}
          values={persistedValue}
        />

        {/* <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          <Button asChild variant="secondary" className="shadow-md">
            <Link href="/product/new">
              <PlusIcon className="mr-1 size-4" />
              Produk
            </Link>
          </Button>
        </div> */}
      </main>
    </div>
  );
}