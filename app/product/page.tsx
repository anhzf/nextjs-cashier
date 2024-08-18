import { listProduct } from '@/calls/products';
import { getPriceDisplay } from '@/utils/models';
import Link from 'next/link';

export default async function ProductPage() {
  const [
    products,
  ] = await Promise.all([
    listProduct(),
  ]);

  return (
    <main className="flex gap-4">
      <table>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-2 w-[20ch]">
                {product.name}
              </td>
              <td className="p-2 text-gray-500">
                {getPriceDisplay(product.variants)}
              </td>
              <td className="p-2">
                <Link href={`/product/${product.id}`} className="btn">
                  <span className="iconify mdi--pencil" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center">
        <Link href="/product/new" className="btn">
          <span className="iconify mdi--plus" />
          <span>Produk Baru</span>
        </Link>
      </div>
    </main>
  );
}