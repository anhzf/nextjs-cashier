import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY, listProduct } from '@/calls/products';
import { getPriceDisplay } from '@/utils/models';
import { BooleanQuerySchema, NumberQuerySchema } from '@/utils/validation';
import Link from 'next/link';
import * as v from 'valibot';

const SearchParamsSchema = v.objectWithRest({
  limit: v.optional(NumberQuerySchema),
  start: v.optional(NumberQuerySchema),
  showHidden: v.optional(BooleanQuerySchema),
  sortBy: v.optional(v.picklist(LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY)),
  sort: v.optional(v.picklist(['asc', 'desc'])),
}, v.string(), 'Invalid query');

interface PageProps {
  searchParams: {
    showHidden?: string;
  };
};

export default async function ProductPage({ searchParams }: PageProps) {
  const query = v.parse(SearchParamsSchema, searchParams);
  const [
    products,
  ] = await Promise.all([
    listProduct(query),
  ]);

  return (
    <main className="flex gap-4">


      <table>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-2 w-[32ch]">
                {product.isHidden && (
                  <small className="bg-gray-100 px-1.5 py-0.5 text-gray-500 rounded-lg">Disembunyikan</small>
                )}
                {product.name}
              </td>
              <td className="p-2 text-gray-500">
                {getPriceDisplay(product.variants)}
              </td>
              <td>
                {product.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-flex justify-center items-center px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
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