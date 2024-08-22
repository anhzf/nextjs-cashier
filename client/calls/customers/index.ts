import type { getCustomer, listCustomer } from '@/calls/customers';

const ENDPOINT = '/api/customer/{customer}';

export const list = async (): Promise<Awaited<ReturnType<typeof listCustomer>>> => {
  const res = await fetch(ENDPOINT.replace('{customer}', ''));
  const { data } = await res.json();
  return data;
};

export const get = async (id: number): Promise<Awaited<ReturnType<typeof getCustomer>>> => {
  const res = await fetch(ENDPOINT.replace('{customer}', String(id)));
  const { data } = await res.json();
  return data;
}