import { auth } from '@/auth';
import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY, createProduct, listProduct } from '@/calls/products';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { BooleanQuerySchema, NumberQuerySchema } from '@/utils/validation';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

export const GET = defineApi(async (req) => {
  const QuerySchema = v.object({
    limit: v.optional(NumberQuerySchema),
    start: v.optional(NumberQuerySchema),
    showHidden: v.optional(BooleanQuerySchema),
    sortBy: v.optional(v.picklist(LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY)),
    sort: v.optional(v.picklist(['asc', 'desc'])),
  }, 'Invalid query');

  const query = v.parse(
    QuerySchema, Object.fromEntries(new URL(req.url).searchParams.entries()),
  );

  const products = await listProduct(query);

  return NextResponse.json({ data: products });
});

export const POST = defineApi(auth(async (req) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    name: v.pipe(v.string('Name is required'), v.minLength(3, 'Name should be more than 3 characters'), v.maxLength(32, 'Name should be less than 32 characters')),
    price: v.number(),
    variants: v.record(v.string(), v.object({
      price: v.number(),
      group: v.optional(v.string()),
    })),
  }, 'Invalid body');

  const body = v.parse(BodySchema, await req.json());

  const created = await createProduct(body);

  return NextResponse.json({
    message: 'Product created successfully',
    data: { id: created },
  });
}));