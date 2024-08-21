import type { listProduct } from '@/calls/products';

const ENDPOINT = '/api/product/{product}';

export const list = async (params?: Record<string, string>): Promise<Awaited<ReturnType<typeof listProduct>>> => {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${ENDPOINT.replace('{product}', '')}?${searchParams}`);
  const { data } = await res.json();
  return data;
};