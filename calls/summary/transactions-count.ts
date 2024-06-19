import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const SUPPORTED_TRANSACTIONS_COUNT_INTERVAL_TIME_UNIT = ['hour', 'day', 'week', 'month'] as const;

interface TransactionCountsOptions {
  start: Date;
  end: Date;
  interval: typeof SUPPORTED_TRANSACTIONS_COUNT_INTERVAL_TIME_UNIT[number];
}

interface TransactionsCount {
  counts: {
    start: Date;
    end: Date;
    count: number;
  }[];
}

export const getSummaryOfTransactionsCount = async ({
  start,
  end,
  interval,
}: TransactionCountsOptions): Promise<TransactionsCount> => {
  const dateRange = db.$with('date_range').as(
    db.select({ start: sql`start`.as('start') })
      .from(sql`(SELECT generate_series(${start}::date, ${end}::date, ${`1 ${interval}`}::interval) AS start)`)
  );

  const result = await db.with(dateRange).select({
    start: sql<Date>`${dateRange.start}`.mapWith((v) => new Date(v)),
    end: sql<Date>`${dateRange.start} + interval '23 hours 59 minutes 59 seconds'`.mapWith((v) => new Date(v)),
    count: sql<number>`COUNT(${transactions.id})`.mapWith(Number),
  }).from(dateRange)
    .leftJoin(transactions, eq(sql`${transactions.createdAt}::date`, dateRange.start))
    .groupBy(dateRange.start)
    .orderBy(dateRange.start);

  return {
    counts: result,
  };
};