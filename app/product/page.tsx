import { listProduct } from '@/calls/products';
import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY } from '@/calls/products/constants';
import { listTag } from '@/calls/tags';
import { AppBar } from '@/components/app-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPriceDisplay } from '@/utils/models';
import { cn } from '@/utils/ui';
import { BooleanQuerySchema, NumberQuerySchema } from '@/utils/validation';
import { EyeOffIcon, PencilIcon, PlusCircleIcon, TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import * as v from 'valibot';
import { ProductListSwitchHidden } from './clients';

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
    <div className="relative h-screen flex flex-col">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Produk
          </h1>

          <Button asChild>
            <Link href="/product/new">
              <PlusCircleIcon className="mr-2 size-4" />
              Produk Baru
            </Link>
          </Button>
        </div>
      </AppBar>

      <main className="container relative flex flex-col gap-2 px-2 py-4">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <Tabs defaultValue={query.tag?.toString() || 'all'}>
            <TabsList>
              <TabsTrigger asChild value="all">
                <Link href={{ query: { ...query, tag: undefined } }}>
                  Semua
                </Link>
              </TabsTrigger>

              {availableTags.map((tag) => (
                <TabsTrigger
                  key={tag.id}
                  asChild
                  value={String(tag.id)}
                >
                  <Link href={{ query: { ...query, tag: tag.id } }}>
                    {tag.name}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ProductListSwitchHidden query={query} />
        </div>

        <ScrollArea className="w-full max-w-full">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] sticky left-0 bg-background">
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
                  <TableCell className="sticky left-0 bg-background p-2">
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
        </ScrollArea>
      </main>
    </div>
  );
}