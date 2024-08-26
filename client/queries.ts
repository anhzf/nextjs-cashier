import { customerApi, productApi } from '@/client/calls';
import { queryOptions, skipToken } from '@tanstack/react-query';

export const createProductsQuery = () => queryOptions({
  queryKey: ['products'],
  queryFn: () => productApi.list(),
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