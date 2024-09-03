import type { TRANSACTION_STATUSES } from '@/constants';
import { db } from '@/db';
import { transactionItems, transactions } from '@/db/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

interface TransactionsTotalAndCountOptions {
  start?: Date;
  end?: Date;
  status?: typeof TRANSACTION_STATUSES[number];
}

export async function getSummaryOfTransactionsTotalAndCount({
  start, end, status,
}: TransactionsTotalAndCountOptions) {
  const [result] = await db.select({
    total: sql<number> `COALESCE(SUM(${transactionItems.price} * ${transactionItems.qty}), 0)`.mapWith(Number),
    items: sql<number> `COALESCE(SUM(${transactionItems.qty}), 0)`.mapWith(Number),
    count: sql<number> `COUNT(${transactionItems.qty})`.mapWith(Number),
  }).from(transactions)
    .leftJoin(
      transactionItems,
      eq(transactions.id, transactionItems.transactionId)
    )
    .where(and(
      status && eq(transactions.status, status),
      start && gte(transactions.createdAt, start),
      end && lte(transactions.createdAt, end)
    ));

  return result;
}