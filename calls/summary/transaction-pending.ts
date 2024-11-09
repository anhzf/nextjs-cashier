import { db } from '@/db';
import { transactionItems, transactions } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

export async function getSummaryOfTransactionPendingDebtAmount(...transactionIds: number[]) {
  const results = await db.select({
    id: transactions.id,
    minus: sql<number>`COALESCE(SUM(${transactionItems.qty} * ${transactionItems.price}), 0) - ${transactions.paid}`,
  })
    .from(transactions)
    .leftJoin(transactionItems, eq(transactions.id, transactionItems.transactionId))
    .where(inArray(transactions.id, transactionIds))
    .groupBy(transactions.id);

  return results;
}