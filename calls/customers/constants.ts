import { customers } from '@/db/schema';
import type { PgColumn } from 'drizzle-orm/pg-core';

type Customer = typeof customers.$inferSelect;

export const sortByMap = {
  name: customers.name,
  phone: customers.phone,
  createdAt: customers.createdAt,
  updatedAt: customers.updatedAt,
} satisfies Partial<Record<keyof Customer, PgColumn>>;

export interface ListCustomerQuery {
  limit?: number;
  start?: number;
  sortBy?: keyof typeof sortByMap;
  sort?: 'asc' | 'desc';
}

export const DEFAULT_LIST_CUSTOMERS_QUERY = {
  limit: 10,
  start: 0,
  sortBy: 'name',
  sort: 'asc',
} satisfies ListCustomerQuery;

export const LIST_CUSTOMER_QUERY_SUPPORTED_SORT_BY = Object.keys(sortByMap) as (keyof typeof sortByMap)[];