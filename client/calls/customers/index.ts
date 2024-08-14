import type { listCustomer } from '@/calls/customers';

const ENDPOINT = '/api/customer/{customer}';

export const list = async (): Promise<ReturnType<typeof listCustomer>> => {
  const res = await fetch(ENDPOINT.replace('{customer}', ''));
  const { data } = await res.json();
  return data;
}