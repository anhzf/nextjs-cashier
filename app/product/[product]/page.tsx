import { getProduct, updateProduct } from '@/calls/products';
import { ProductForm, type ProductFieldValues, type ProductFormAction } from '@/components/product-form';
import { PRODUCT_VARIANT_NO_VARIANTS } from '@/constants';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    product: string;
  };
}

const lempar = (msg: string) => {
  throw new Error(msg);
}

const createAction = (id: number, initial: ProductFieldValues): ProductFormAction => (
  async (payload) => {
    'use server';

    const variants = Object.fromEntries((payload.variants?.length ? payload.variants : [
      {
        name: PRODUCT_VARIANT_NO_VARIANTS.name,
        attrs: {
          price: payload.price ?? lempar('Product must have price or variants'),
        },
      }
    ]).map((variant) => [variant.name, variant.attrs]));

    await updateProduct(id, {
      name: payload.name,
      variants,
      /* TODO: Support updating tags */
      // tags: payload.tags?.map((tag) => tag.tagId) ?? [],
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
    price: product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price,
    tags: product.tags.map((tag) => ({ tagId: tag.tag.id })),
  };

  return (
    <main>
      <h1 className="text-3xl">Edit Produk</h1>
      <ProductForm
        values={fieldValues}
        action={createAction(productId, fieldValues)}
      />
    </main>
  );
}