import { getProduct, updateProduct } from '@/calls/products';
import { ProductForm, type ProductFieldValues, type ProductFormAction } from '@/components/product-form';
import { PRODUCT_VARIANT_NO_VARIANTS } from '@/constants';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { diff } from 'just-diff';
import type { ProductVariants } from '@/db/schema';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

interface PageProps {
  params: {
    product: string;
  };
}

const createAction = (id: number, initial: ProductFieldValues): ProductFormAction => (
  async (payload) => {
    'use server';

    const variants: ProductVariants = {
      [PRODUCT_VARIANT_NO_VARIANTS.name]: {
        price: payload.price,
      },
    };

    const diffs = initial.tags && payload.tags && diff(initial.tags, payload.tags);

    await updateProduct(id, {
      name: payload.name,
      variants,
      unit: payload.unit,
      isHidden: payload.isHidden,
      tags: diffs?.filter(diff => diff.op !== 'replace')
        .map((diff) => {
          if (diff.op === 'add') {
            return {
              value: diff.value.value,
              type: 'add',
            };
          }

          // expect a remove operation
          return {
            type: 'remove',
            value: initial.tags![diff.path[0] as number].value,
          };
        }),
    });

    revalidatePath('/product');
    revalidatePath(`/product/${id}`);
    redirect('/product');
  }
);

export default async function ProductEditPage({ params }: PageProps) {
  const productId = Number(params.product);
  const [
    product,
  ] = await Promise.all([
    getProduct(productId),
  ]);

  const fieldValues: ProductFieldValues = {
    name: product.name,
    unit: product.unit,
    isHidden: product.isHidden,
    price: product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price,
    tags: product.tags.map(({ tag }) => ({ value: tag.name })),
  };

  return (
    <main className="container relative h-screen flex flex-col p-0">
      <div className="flex items-center gap-4 p-4">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/product">
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
        </Button>

        <h1 className="text-2xl font-bold ">
          Perbarui <span className="text-blue-500">{product.name}</span>
        </h1>

        <div />
      </div>

      <div className="p-4">
        <ProductForm
          values={fieldValues}
          action={createAction(productId, fieldValues)}
        />
      </div>
    </main>
  );
}