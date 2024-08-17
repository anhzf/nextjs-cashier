import { createProduct } from '@/calls/products';
import { ProductForm, type ProductFormAction } from '@/components/product-form';
import { PRODUCT_VARIANT_NO_VARIANTS } from '@/constants';

const lempar = (msg: string) => {
  throw new Error(msg);
}

const action: ProductFormAction = async (payload) => {
  'use server';

  const variants = Object.fromEntries((payload.variants?.length ? payload.variants : [
    {
      name: PRODUCT_VARIANT_NO_VARIANTS.name,
      attrs: {
        price: payload.price ?? lempar('Product must have price or variants'),
      },
    }
  ]).map((variant) => [variant.name, variant.attrs]));

  await createProduct({
    name: payload.name,
    variants,
    tags: payload.tags?.map((tag) => tag.tagId) ?? [],
  });
};

export default function ProductNewPage() {
  return (
    <main>
      <h1 className="text-3xl">Tambah Produk</h1>
      <ProductForm action={action} />
    </main>
  );
}