import { Card, CardContent } from '@/components/ui/card';
import { PRODUCT_VARIANT_NO_VARIANTS } from '@/constants';
import type { products } from '@/db/schema';
import { priceFormatter } from '@/utils/format';
import { memo, useEffect, useRef, type ReactNode } from 'react';
import autoAnimate from '@formkit/auto-animate';

type Product = typeof products.$inferSelect;

interface ProductListProps {
  items: Product[];
  itemAppend?: (product: Product) => ReactNode;
  itemSubtitle?: (product: Product) => ReactNode;
}

export const ProductList = memo(function ProductList({ items, itemAppend, itemSubtitle }: ProductListProps) {
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent]);

  return (
    <div ref={parent} className="flex flex-col gap-2">
      {items.map((product) => (
        <Card key={product.id} className="p-2">
          <CardContent className="p-0">
            <div className="flex justify-between items-center mb-1 gap-2">
              <h2 className="font-semibold">{product.name}</h2>
              {itemAppend?.(product)}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                {itemSubtitle?.(product) ?? (
                  <p className="text-sm text-muted-foreground">
                    {priceFormatter.format(product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price)} | Stock: {product.stock}
                  </p>
                )}
              </div>
              {/* <div className="flex flex-wrap justify-end gap-1">
                {product.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div> */}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})