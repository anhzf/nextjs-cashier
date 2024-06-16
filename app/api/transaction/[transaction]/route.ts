import { auth } from '@/auth';
import { deleteTransaction, getTransaction, updateTransaction } from '@/calls/transactions';
import { transactionStatusEnum } from '@/db/schema';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const GET = defineApi(async (req, ctx) => {
  return NextResponse.json({
    data: await getTransaction(Number(ctx.params.customer)),
  });
});


export const PUT = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    code: v.optional(v.string()),
    status: v.optional(v.picklist(transactionStatusEnum.enumValues)),
  });

  const body = v.parse(BodySchema, await req.json());

  await updateTransaction(Number(ctx.params?.transaction), body);

  return NextResponse.json({ message: 'Successfully updated transaction' });
}));

export const DELETE = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  await deleteTransaction(Number(ctx.params?.transaction));

  return NextResponse.json({ message: 'Successfully deleted transaction' });
}));