import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { notFound } from 'next/navigation';

type Product = typeof products.$inferSelect;

const sortByMap = {
  name: products.name,
  brand: products.brand,
  type: products.type,
  size: products.size,
  price: products.price,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
} satisfies Record<string, PgColumn>;

interface ListProductsQuery {
  limit?: number;
  start?: number;
  showHidden?: boolean;
  sortBy?: keyof typeof sortByMap;
}

const DEFAULT_LIST_PRODUCTS_QUERY = {
  limit: 10,
  start: 0,
  showHidden: false,
  sortBy: 'name',
} satisfies ListProductsQuery;

export const LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY = Object.keys(sortByMap) as (keyof typeof sortByMap)[];

export const listProduct = async (query?: ListProductsQuery): Promise<Product[]> => {
  const { limit, start, showHidden, sortBy } = { ...DEFAULT_LIST_PRODUCTS_QUERY, ...query };

  const results = await db.query.products.findMany({
    where: eq(products.isHidden, showHidden),
    orderBy: sortByMap[sortBy],
    limit,
    offset: start,
  });

  return results;
};

export const getProduct = async (id: number): Promise<Product> => {
  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
  });

  if (!result) return notFound();

  return result;
};

type CreateProductData = Omit<typeof products.$inferInsert, 'isHidden' | 'id' | 'createdAt' | 'updatedAt'>;

export const createProduct = async (data: CreateProductData): Promise<number> => {
  const [result] = await db.insert(products).values(data).returning({
    id: products.id,
  });

  return result.id;
};

type UpdateProductData = Partial<Omit<typeof products.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>;

export const updateProduct = async (id: number, data: UpdateProductData): Promise<number> => {
  const [result] = await db.update(products).set(data).where(eq(products.id, id)).returning({
    id: products.id,
  });

  if (!result) return notFound();

  return result.id;
};

export const deleteProduct = async (id: number): Promise<number> => {
  const [result] = await db.delete(products).where(eq(products.id, id)).returning({
    id: products.id,
  });

  if (!result) return notFound();

  return result.id;
};