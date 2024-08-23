import { listProduct } from '@/calls/products';
import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY } from '@/calls/products/constants';
import { listTag } from '@/calls/tags';
import { getPriceDisplay } from '@/utils/models';
import { cn } from '@/utils/ui';
import { BooleanQuerySchema, NumberQuerySchema } from '@/utils/validation';
import Link from 'next/link';
import * as v from 'valibot';

const SearchParamsSchema = v.objectWithRest({
  limit: v.optional(NumberQuerySchema),
  start: v.optional(NumberQuerySchema),
  showHidden: v.optional(BooleanQuerySchema),
  sortBy: v.optional(v.picklist(LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY)),
  sort: v.optional(v.picklist(['asc', 'desc'])),
  tag: v.optional(NumberQuerySchema),
}, v.string(), 'Invalid query');

interface PageProps {
  searchParams: Record<string, string | string[]>;
};

export default async function ProductPage({ searchParams }: PageProps) {
  const query = v.parse(SearchParamsSchema, searchParams);
  const [
    products,
    availableTags,
  ] = await Promise.all([
    listProduct(query),
    listTag(),
  ]);

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Produk</h1>

      <div className="flex items-center">
        <Link
          href={{ query: { ...searchParams, showHidden: !query.showHidden } }}
          className="btn"
        >
          <span className={cn('iconify', query.showHidden ? 'mdi--checkbox-marked' : 'mdi--checkbox-blank')} />
          <span>Produk tersembunyi</span>
        </Link>

        <Link href="/product/new" className="btn">
          <span className="iconify mdi--plus" />
          <span>Produk Baru</span>
        </Link>
      </div>

      <div className="flex">
        {availableTags.map((tag) => (
          <Link
            key={tag.id}
            href={{ query: { ...searchParams, tag: tag.id } }}
            className={cn(
              'inline-flex px-2.5 has-[.iconify:first-child]:pl-1.5 has-[.iconify:last-child]:pr-1.5 py-0.5 bg-gray-100 hover:bg-gray-200/80 active:bg-gray-200 justify-center items-center gap-1.5 text-gray-500 rounded-full',
              query.tag === tag.id && 'text-gray-700'
            )}
          >

            {query.tag === tag.id && <span className="iconify mdi--check" />}
            <span>{tag.name}</span>
          </Link>
        ))}

        {query.tag && (
          <Link
            href={{ query: { ...searchParams, tag: undefined } }}
            className={cn(
              'inline-flex px-2.5 has-[.iconify:first-child]:pl-1.5 has-[.iconify:last-child]:pr-1.5 py-0.5 hover:bg-gray-100/80 active:bg-gray-100 justify-center items-center gap-1.5 text-gray-500 rounded-full',
            )}
          >

            <span className="iconify mdi--close" />
            <span>Hapus tag</span>
          </Link>
        )}
      </div>

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
              <td className="w-[8ch]">
                {product.stock} {product.unit}
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
    </main>
  );
}