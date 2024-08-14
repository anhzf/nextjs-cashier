import { auth } from '@/auth';
import { createCustomer, listCustomer } from '@/calls/customers';
import { LIST_CUSTOMER_QUERY_SUPPORTED_SORT_BY } from '@/calls/customers/constants';
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
    sortBy: v.optional(v.picklist(LIST_CUSTOMER_QUERY_SUPPORTED_SORT_BY)),
    sort: v.optional(v.picklist(['asc', 'desc'])),
  }, 'Invalid query');

  const query = v.parse(
    QuerySchema, Object.fromEntries(new URL(req.url).searchParams),
  );

  const customers = await listCustomer(query);

  return NextResponse.json({ data: customers });
});

export const POST = defineApi(auth(async (req) => {
  if (!req.auth?.user) return notAuthorized();

  const BodySchema = v.object({
    name: v.pipe(v.string('Name is required'), v.minLength(3, 'Name should be more than 3 characters'), v.maxLength(32, 'Name should be less than 32 characters')),
    phone: v.optional(v.pipe(v.string(), v.regex(/^\d{10,13}$/, 'Phone should be 10-13 digits long'))),
  }, 'Invalid body');

  const body = v.parse(BodySchema, await req.json());

  const created = await createCustomer(body);

  return NextResponse.json({
    message: 'Customer created successfully',
    data: { id: created },
  });
}));