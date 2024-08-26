import type { listProduct } from '@/calls/products';
import { APP_URL } from '@/constants';

const ENDPOINT = `${APP_URL}/api/product/{product}`;

export const list = async (params?: Record<string, string>): Promise<Awaited<ReturnType<typeof listProduct>>> => {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${ENDPOINT.replace('{product}', '')}?${searchParams}`);
  const { data } = await res.json();
  return data;
};