import { productApi } from '@/client/calls';
import type { products } from '@/db/schema';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { memo } from 'react';

interface ProductQueryProps {
  children?: (data: (typeof products.$inferSelect)[]) => React.ReactNode;
}

const createQueryOptions = () => queryOptions({
  queryKey: ['products'],
  queryFn: () => productApi.list(),
  placeholderData: [],
  // initialData: [],
});

export const ProductQuery = memo<ProductQueryProps>(function ProductQuery({ children }) {
  const { data } = useQuery(createQueryOptions());

  return children?.(data ?? []) ?? JSON.stringify(data);
});