import { products } from '@/db/schema';
import type { PgColumn } from 'drizzle-orm/pg-core';

export const ProductSortByMap = {
  name: products.name,
  stock: products.stock,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
} satisfies Record<string, PgColumn>;

export interface ListProductQuery {
  limit?: number;
  start?: number;
  showHidden?: boolean;
  sortBy?: keyof typeof ProductSortByMap;
  sort?: 'asc' | 'desc';
  tag?: number;
  // False means show all products
  // Number means only show products with stock <= number
  stock?: boolean | number;
}

export const DEFAULT_LIST_PRODUCTS_QUERY = {
  limit: 10,
  start: 0,
  showHidden: false,
  sortBy: 'name',
  sort: 'asc',
  stock: true,
} satisfies ListProductQuery;

export const LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY = Object.keys(ProductSortByMap) as (keyof typeof ProductSortByMap)[];

export const ALLOWED_PRODUCT_INSERT_FIELDS = ['name', 'variants', 'unit', 'isHidden'] satisfies (keyof typeof products.$inferInsert)[];

export const ALLOWED_PRODUCT_UPDATE_FIELDS = ['name', 'variants', 'isHidden', 'unit'] satisfies (keyof typeof products.$inferInsert)[];