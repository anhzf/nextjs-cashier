import { listProduct } from '@/calls/products';
import Link from 'next/link';

export default async function ProductPage() {
  const [
    products,
  ] = await Promise.all([
    listProduct(),
  ]);

  return (
    <main className="flex gap-4">
      <pre className="whitespace-pre">{JSON.stringify(products, null, 2)}</pre>
      <div className="flex items-center">
        <Link href="/product/new" className="btn">
          <span className="iconify mdi--plus" />
          <span>Produk Baru</span>
        </Link>
      </div>
    </main>
  );
}