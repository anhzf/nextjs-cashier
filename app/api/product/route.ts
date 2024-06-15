import { auth } from '@/auth';
import { LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY, createProduct, listProduct } from '@/calls/products';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';
import * as v from 'valibot';

const numberQuery = v.pipe(v.string(), v.regex(/\d+/, 'Should be number'), v.transform(parseInt));
const booleanQuery = v.pipe(v.string(), v.regex(/true|false/, 'Should be exactly true/false value'), v.transform((x) => x === 'true'));

export const GET = defineApi(async (req) => {
  const QuerySchema = v.object({
    limit: v.optional(numberQuery),
    start: v.optional(numberQuery),
    showHidden: v.optional(booleanQuery),
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
    brand: v.optional(v.pipe(v.string('Brand should be string'), v.minLength(3, 'Brand should be more than 3 characters'), v.maxLength(32, 'Brand should be less than 32 characters'))),
    type: v.optional(v.pipe(v.string('Type should be string'), v.minLength(3, 'Type should be more than 3 characters'), v.maxLength(32, 'Type should be less than 32 characters'))),
    size: v.optional(v.pipe(v.string('Size should be string'), v.minLength(3, 'Size should be more than 3 characters'), v.maxLength(32, 'Size should be less than 32 characters'))),
    price: v.number(),
  }, 'Invalid body');

  const body = v.parse(BodySchema, await req.json());

  const created = await createProduct(body);

  return NextResponse.json({
    message: 'Product created successfully',
    data: { id: created },
  });
}));