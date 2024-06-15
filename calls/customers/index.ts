import { db } from '@/db';
import { customers } from '@/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { notFound } from 'next/navigation';

type Customer = typeof customers.$inferSelect;

const sortByMap = {
  name: customers.name,
  email: customers.email,
  phone: customers.phone,
  address: customers.address,
  type: customers.type,
  createdAt: customers.createdAt,
  updatedAt: customers.updatedAt,
} satisfies Partial<Record<keyof Customer, PgColumn>>;

interface ListCustomerQuery {
  limit?: number;
  start?: number;
  sortBy?: keyof typeof sortByMap;
  sort?: 'asc' | 'desc';
}

const DEFAULT_LIST_CUSTOMERS_QUERY = {
  limit: 10,
  start: 0,
  sortBy: 'name',
  sort: 'asc',
} satisfies ListCustomerQuery;

export const LIST_CUSTOMER_QUERY_SUPPORTED_SORT_BY = Object.keys(sortByMap) as (keyof typeof sortByMap)[];

export const listCustomer = async (query?: ListCustomerQuery): Promise<Customer[]> => {
  const { limit, start, sortBy, sort } = { ...DEFAULT_LIST_CUSTOMERS_QUERY, ...query };

  const results = await db.query.customers.findMany({
    orderBy: sort === 'desc' ? desc(sortByMap[sortBy]) : asc(sortByMap[sortBy]),
    limit,
    offset: start,
  });

  return results;
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const result = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!result) return notFound();

  return result;
};

type CreateCustomerData = Omit<typeof customers.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;

export const createCustomer = async (data: CreateCustomerData): Promise<number> => {
  const [result] = await db.insert(customers).values(data).returning({
    id: customers.id,
  });

  return result.id;
};

type UpdateCustomerData = Partial<Omit<typeof customers.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>;

export const updateCustomer = async (id: number, data: UpdateCustomerData): Promise<void> => {
  const [result] = await db.update(customers).set(data).where(eq(customers.id, id)).returning({
    id: customers.id,
  });

  if (!result) return notFound();
};

export const deleteCustomer = async (id: number): Promise<void> => {
  const result = await db.delete(customers).where(eq(customers.id, id));

  if (!result) return notFound();
};