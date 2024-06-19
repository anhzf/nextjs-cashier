import { SUPPORTED_TRANSACTIONS_COUNT_INTERVAL_TIME_UNIT, getSummaryOfTransactionsCount } from '@/calls/summary/transactions-count';
import { defineApi } from '@/utils/api';
import { DateQuerySchema } from '@/utils/validation';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const GET = defineApi(async (req) => {
  const QuerySchema = v.object({
    start: DateQuerySchema,
    end: v.optional(DateQuerySchema, new Date().toISOString()),
    interval: v.optional(v.picklist(SUPPORTED_TRANSACTIONS_COUNT_INTERVAL_TIME_UNIT), 'day'),
  }, 'Invalid query');

  const query = v.parse(
    QuerySchema, Object.fromEntries(new URL(req.url).searchParams.entries()),
  );

  return NextResponse.json({
    data: await getSummaryOfTransactionsCount(query),
  });
});