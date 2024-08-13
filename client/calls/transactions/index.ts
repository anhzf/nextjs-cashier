import type { ListTransactionQuery } from '@/calls/transactions';
import type { transactions } from '@/db/schema';

const ENDPOINT = '/api/transaction';

type Transaction = typeof transactions.$inferSelect;

export const list = async (query?: ListTransactionQuery): Promise<Transaction[]> => {
  const search = new URLSearchParams(query as Record<string, string>);
  const res = await fetch(`${ENDPOINT}?${search}`);
  const { data } = await res.json();
  return data;
};