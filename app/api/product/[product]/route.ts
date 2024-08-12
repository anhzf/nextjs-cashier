import { auth } from '@/auth';
import { deleteProduct, getProduct, updateProduct } from '@/calls/products';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

type HandlerCtx = {
  params: {
    product: string;
  };
};

export const GET = defineApi(async (req, ctx: HandlerCtx) => {
  return NextResponse.json({
    data: await getProduct(Number(ctx.params.product)),
  });
});

export const PUT = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    name: v.optional(v.pipe(v.string(), v.minLength(3, 'Name should be more than 3 characters'), v.maxLength(32, 'Name should be less than 32 characters'))),
    price: v.optional(v.number()),
  }, 'Invalid body');

  const body = v.parse(BodySchema, await req.json());

  await updateProduct(Number(ctx.params?.product), body);

  return NextResponse.json({ message: 'Product updated successfully' });
}));

export const DELETE = defineApi(auth(async (req, ctx) => {
  if (!req.auth?.user) return notAuthorized();

  await deleteProduct(Number(ctx.params?.product));

  return NextResponse.json({ message: 'Product deleted successfully' });
}));