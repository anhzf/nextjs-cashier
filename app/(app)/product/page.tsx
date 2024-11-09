import { listProduct } from '@/calls/products';
import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY } from '@/calls/products/constants';
import { listTag } from '@/calls/tags';
import { AppBar } from '@/components/app-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPriceDisplay } from '@/utils/models';
import { cn } from '@/utils/ui';
import { BooleanQuerySchema, NumberQuerySchema } from '@/utils/validation';
import { EyeOffIcon, PencilIcon, PlusIcon, TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import * as v from 'valibot';
import { FilterBar } from './clients';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY } from '@/calls/transactions';
import { Label } from '@/components/ui/label';

const SearchParamsSchema = v.objectWithRest({
  limit: v.optional(NumberQuerySchema),
  start: v.optional(NumberQuerySchema),
  showHidden: v.optional(BooleanQuerySchema),
  sortBy: v.optional(v.picklist(LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY)),
  sort: v.optional(v.picklist(['asc', 'desc'])),
  tag: v.optional(
    v.union([
      v.pipe(v.literal('$all'), v.transform(() => undefined)),
      NumberQuerySchema,
    ]),
  ),
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
    // TODO: Implement pagination
    listProduct({ ...query, stock: false, limit: Infinity }),
    listTag(),
  ]);

  return (
    <div className="relative h-screen max-w-[100vw] flex flex-col overflow-auto">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Produk
          </h1>

          <div className="flex justify-end gap-2">
            <Button asChild variant="secondary">
              <Link href="/stock/new">
                <PlusIcon className="mr-2 size-4" />
                Stok
              </Link>
            </Button>

            <Button asChild>
              <Link href="/product/new">
                <PlusIcon className="mr-2 size-4" />
                Produk
              </Link>
            </Button>
          </div>
        </div>
      </AppBar>

      <main className="container relative flex px-0 flex-col gap-2">
        <FilterBar availableTags={availableTags} query={query} />

        <div className="w-full px-4 py-2 overflow-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  #
                </TableHead>
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
              {products.map((product, i) => (
                <TableRow key={product.id}>
                  <TableCell className="w-[4ch] text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="">
                    <div className={`font-medium flex items-center gap-2 ${product.isHidden ? "text-muted-foreground" : ""}`}>
                      {product.isHidden && (
                        <EyeOffIcon className="h-4 w-4" aria-label="Hidden product" />
                      )}
                      {product.name}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.tags.map(({ tag }) => (
                        <Badge
                          key={tag.id}
                          variant={product.isHidden ? "outline" : "secondary"}
                          className={['hover:bg-gray-300/75 active:bg-gray-300', product.isHidden ? 'text-muted-foreground' : ''].join(' ')}
                        >
                          <Link href={{ query: { ...searchParams, tag: tag.id } }}>
                            {tag.name}
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="p-2 text-gray-500">
                    {getPriceDisplay(product.variants)}
                  </TableCell>

                  <TableCell className={cn('w-[12ch]', { 'text-red-500': product.stock < 1 })}>
                    <div className="inline-flex gap-1">
                      {product.stock < 1 && (
                        <TriangleAlertIcon className="h-4 w-4" aria-label="Out of stock" />
                      )}
                      {product.stock} {product.unit}
                    </div>
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
        </div>
      </main >
    </div >
  );
}