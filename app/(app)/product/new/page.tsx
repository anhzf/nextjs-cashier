import { createProduct } from '@/calls/products';
import { AppBar } from '@/components/app-bar';
import { ProductForm, type ProductFormAction } from '@/components/product-form';
import { Button } from '@/components/ui/button';
import { PRODUCT_VARIANT_NO_VARIANTS } from '@/constants';
import type { ProductVariants } from '@/db/schema';
import { ArrowLeftIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const action: ProductFormAction = async (payload) => {
  'use server';

  const variants: ProductVariants = {
    [PRODUCT_VARIANT_NO_VARIANTS.name]: {
      price: payload.price,
    },
  };

  await createProduct({
    name: payload.name,
    variants,
    unit: payload.unit,
    tags: payload.tags?.map(({ value }) => value),
    isHidden: payload.isHidden,
  });

  revalidatePath('/product');
  redirect('/product');
};

export default function ProductNewPage() {
  return (
    <div className="relative h-screen flex flex-col">
      <AppBar showMenu={false}>
        <div className="grow flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="shrink-0">
            <Link href="/product">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </Button>

          <h1 className="text-xl font-bold">
            Produk Baru
          </h1>
        </div>
      </AppBar>

      <main className="container relative flex flex-col p-4">
        <ProductForm
          action={action}
        />
      </main>
    </div>
  );
}