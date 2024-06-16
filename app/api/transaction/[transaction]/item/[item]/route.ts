import { auth } from '@/auth';
import { deleteTransactionItem, updateTransactionItem } from '@/calls/transactions';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const PUT = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    price: v.optional(v.number('Price must be a number')),
    qty: v.optional(v.number('Qty must be a number')),
  });

  const body = v.parse(BodySchema, await req.json());

  await updateTransactionItem(Number(ctx.params?.transaction), Number(ctx.params?.item), body);

  return NextResponse.json({ message: 'Successfully updated item from transaction' });
}));

export const DELETE = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  await deleteTransactionItem(Number(ctx.params?.transaction), Number(ctx.params?.item));

  return NextResponse.json({ message: 'Successfully deleted item from transaction' });
}));