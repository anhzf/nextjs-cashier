'use server';
// TODO: Protect/filter allowed fields for insert and update

import { ALLOWED_CUSTOMER_INSERT_FIELDS, ALLOWED_CUSTOMER_UPDATE_FIELDS, DEFAULT_LIST_CUSTOMERS_QUERY, sortByMap, type ListCustomerQuery } from '@/calls/customers/constants';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { pick } from '@/utils/object';
import { asc, desc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

type Customer = typeof customers.$inferSelect;

export async function listCustomer(query?: ListCustomerQuery): Promise<Customer[]> {
  const { limit, start, sortBy, sort } = { ...DEFAULT_LIST_CUSTOMERS_QUERY, ...query };

  const results = await db.query.customers.findMany({
    orderBy: sort === 'desc' ? desc(sortByMap[sortBy]) : asc(sortByMap[sortBy]),
    limit,
    offset: start,
  });

  return results;
}

export async function getCustomer(id: number): Promise<Customer> {
  const result = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!result) return notFound();

  return result;
}

type CreateCustomerData = Pick<typeof customers.$inferInsert, typeof ALLOWED_CUSTOMER_INSERT_FIELDS[number]>;

export async function createCustomer(data: CreateCustomerData): Promise<number> {
  const [result] = await db.insert(customers).values(
    pick(data, ...ALLOWED_CUSTOMER_INSERT_FIELDS),
  ).returning({
    id: customers.id,
  });

  return result.id;
}

type UpdateCustomerData = Partial<Pick<typeof customers.$inferInsert, typeof ALLOWED_CUSTOMER_UPDATE_FIELDS[number]>>;

export async function updateCustomer(id: number, data: UpdateCustomerData): Promise<void> {
  const [result] = await db.update(customers).set({
    ...pick(data, ...ALLOWED_CUSTOMER_UPDATE_FIELDS),
    updatedAt: new Date(),
  }).where(eq(customers.id, id)).returning({
    id: customers.id,
  });

  if (!result) return notFound();
}

export async function deleteCustomer(id: number): Promise<void> {
  const result = await db.delete(customers).where(eq(customers.id, id));

  if (!result) return notFound();
}