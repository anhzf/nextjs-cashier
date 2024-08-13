import { auth } from '@/auth';
import { LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY, createTransaction, listTransaction } from '@/calls/transactions';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NumberQuerySchema } from '@/utils/validation';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const GET = defineApi(async (req) => {
  const QuerySchema = v.object({
    limit: v.optional(NumberQuerySchema),
    start: v.optional(NumberQuerySchema),
    sortBy: v.optional(v.picklist(LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY)),
    sort: v.optional(v.picklist(['asc', 'desc'])),
  }, 'Invalid query');

  const query = v.parse(
    QuerySchema, Object.fromEntries(new URL(req.url).searchParams.entries()),
  );

  const transactions = await listTransaction(query);

  return NextResponse.json({ data: transactions });
});

export const POST = defineApi(auth(async (req) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    code: v.optional(v.string()),
    customerId: v.number('CustomerId must be a number'),
    items: v.array(v.object({
      productId: v.number('ProductId must be a number'),
      price: v.optional(v.number('Price must be a number')),
      qty: v.optional(v.number('Qty must be a number')),
      variant: v.string('Variant must be a string'),
    })),
  }, 'Invalid body');

  const body = v.parse(BodySchema, await req.json());

  const transactionId = await createTransaction({
    ...body,
    userId: Number(req.auth.user.id),
  });

  return NextResponse.json({ data: transactionId });
}));