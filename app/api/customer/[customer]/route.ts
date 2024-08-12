import { auth } from '@/auth';
import { deleteCustomer, getCustomer, updateCustomer } from '@/calls/customers';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const GET = defineApi(async (req, ctx) => {
  return NextResponse.json({
    data: await getCustomer(Number(ctx.params.customer)),
  });
});

export const PUT = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    name: v.optional(v.pipe(v.string(), v.minLength(3, 'Name should be more than 3 characters'), v.maxLength(32, 'Name should be less than 32 characters'))),
    phone: v.optional(v.pipe(v.string(), v.regex(/^\d{10,13}$/, 'Phone should be 10-13 digits long'))),
  }, 'Invalid body');

  const body = v.parse(BodySchema, await req.json());

  await updateCustomer(Number(ctx.params?.customer), body);

  return NextResponse.json({ message: 'Customer updated successfully' });
}));

export const DELETE = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  await deleteCustomer(Number(ctx.params?.customer));

  return NextResponse.json({ message: 'Customer deleted successfully' });
}));