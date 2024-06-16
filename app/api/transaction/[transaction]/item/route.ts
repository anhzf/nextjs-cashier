import { auth } from '@/auth';
import { addItemsToTransaction } from '@/calls/transactions';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const POST = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    items: v.array(v.object({
      productId: v.number('ProductId must be a number'),
      price: v.optional(v.number('Price must be a number')),
      qty: v.optional(v.number('Qty must be a number')),
    })),
  });

  const body = v.parse(BodySchema, await req.json());

  await addItemsToTransaction(Number(ctx.params?.transaction), body.items);

  return NextResponse.json({ message: 'Successfully added items into transaction' });
}));