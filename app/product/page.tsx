import { listProduct } from '@/calls/products';
import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY } from '@/calls/products/constants';
import { listTag } from '@/calls/tags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { getPriceDisplay } from '@/utils/models';
import { cn } from '@/utils/ui';
import { BooleanQuerySchema, NumberQuerySchema } from '@/utils/validation';
import { EyeOffIcon, PencilIcon, PlusCircleIcon } from 'lucide-react';
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
    <main className="container flex flex-col gap-4 py-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Produk</h1>

        <div className="flex items-center">
          <Button asChild>
            <Link href="/product/new">
              <PlusCircleIcon className="mr-2 size-4" />
              Produk Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild variant="ghost">
          <Link href={{ query: { ...searchParams, showHidden: !query.showHidden } }}>
            <span className={cn('iconify mr-2', query.showHidden ? 'mdi--checkbox-marked-outline' : 'mdi--checkbox-blank-outline')} />
            <span>Produk tersembunyi</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
            >
              <Link
                href={{ query: { ...searchParams, tag: tag.id } }}
                className={cn(
                  'inline-flex justify-center items-center gap-1.5',
                )}
              >
                {query.tag === tag.id && <span className="iconify mdi--check" />}
                <span>{tag.name}</span>
              </Link>
            </Badge>
          ))}

          {query.tag && (
            <Link href={{ query: { ...searchParams, tag: undefined } }}>
              <Badge variant="outline">
                <span className="iconify mdi--close" />
                <span>Hapus tag</span>
              </Badge>
            </Link>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">
              Nama
            </TableHead>
            <TableHead>
              Harga
            </TableHead>
            <TableHead>
              Stok
            </TableHead>
            <TableHead className="text-right">
              ...
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="p-2 w-[32ch]">
                <div className={`font-medium flex items-center gap-2 ${product.isHidden ? "text-muted-foreground" : ""}`}>
                  {product.name}
                  {product.isHidden && (
                    <EyeOffIcon className="h-4 w-4" aria-label="Hidden product" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map(({ tag }) => (
                    <Badge
                      key={tag.id}
                      variant={product.isHidden ? "outline" : "secondary"}
                      className={product.isHidden ? "text-muted-foreground" : ""}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell className="p-2 text-gray-500">
                {getPriceDisplay(product.variants)}
              </TableCell>

              <TableCell className="w-[8ch]">
                {product.stock} {product.unit}
              </TableCell>

              <TableCell className="text-right p-2">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                >
                  <Link href={`/product/${product.id}`} className="btn">
                    <PencilIcon className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}