import { customerApi, productApi, tagApi } from '@/client/calls';
import { queryOptions, skipToken } from '@tanstack/react-query';

export const createProductsQuery = (filter?: Record<string, string>) => queryOptions({
  queryKey: ['products', filter],
  queryFn: () => productApi.list(filter),
  placeholderData: [],
  // initialData: [],
});

export const createCustomersQuery = () => queryOptions({
  queryKey: ['customers'],
  queryFn: () => customerApi.list(),
  placeholderData: [],
  // initialData: [],
});

export const createCustomerQuery = (id?: number) => queryOptions({
  queryKey: ['customer', id],
  queryFn: id === undefined ? skipToken : () => customerApi.get(id),
  enabled: !!id,
});

export const createTagsQuery = () => queryOptions({
  queryKey: ['tags'],
  queryFn: () => tagApi.list(),
  placeholderData: [],
  // initialData: [],
});