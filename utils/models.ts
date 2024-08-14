import type { products } from '@/db/schema';

const priceFormatter = new Intl.NumberFormat('id', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
});

export const getPriceRange = (productVariants: typeof products.$inferSelect.variants) => {
  const prices = Object.values(productVariants).map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return { min, max };
};

export const getPriceDisplay = (productVariants: typeof products.$inferSelect.variants) => {
  const { min, max } = getPriceRange(productVariants);

  return min === max
    ? priceFormatter.format(min)
    : `${priceFormatter.format(min)} - ${priceFormatter.format(max)}`;
};