import type { listProduct } from '@/calls/products';

const ENDPOINT = '/api/product/{product}';

export const list = async (): Promise<ReturnType<typeof listProduct>> => {
  const res = await fetch(ENDPOINT.replace('{product}', ''));
  const { data } = await res.json();
  return data;
};