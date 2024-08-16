// TODO: Support updating tags
// TODO: Protect/filter allowed fields for insert and update
import { db } from '@/db';
import { products, productTags } from '@/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import { notFound } from 'next/navigation';

type Product = typeof products.$inferSelect;

const sortByMap = {
  name: products.name,
  createdAt: products.createdAt,
  updatedAt: products.updatedAt,
} satisfies Record<string, PgColumn>;

interface ListProductQuery {
  limit?: number;
  start?: number;
  showHidden?: boolean;
  sortBy?: keyof typeof sortByMap;
  sort?: 'asc' | 'desc';
}

const DEFAULT_LIST_PRODUCTS_QUERY = {
  limit: 10,
  start: 0,
  showHidden: false,
  sortBy: 'name',
  sort: 'asc',
} satisfies ListProductQuery;

export const LIST_PRODUCT_QUERY_SUPPORTED_SORT_BY = Object.keys(sortByMap) as (keyof typeof sortByMap)[];

export const listProduct = async (query?: ListProductQuery): Promise<Product[]> => {
  const { limit, start, showHidden, sortBy, sort } = { ...DEFAULT_LIST_PRODUCTS_QUERY, ...query };

  const results = await db.query.products.findMany({
    where: eq(products.isHidden, showHidden),
    orderBy: sort === 'desc' ? desc(sortByMap[sortBy]) : asc(sortByMap[sortBy]),
    limit,
    offset: start,
    with: {
      tags: {
        with: {
          tag: {
            columns: {
              id: true,
              name: true,
            },
          },
        }
      },
    },
  });

  return results;
};

export const getProduct = async (id: number): Promise<Product> => {
  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      tags: {
        with: {
          tag: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      }
    },
  });

  if (!result) return notFound();

  return result;
};

type CreateProductData = Omit<typeof products.$inferInsert, 'isHidden' | 'id' | 'createdAt' | 'updatedAt'>
  & { tags?: number[] };

export const createProduct = async ({ tags, ...data }: CreateProductData): Promise<number> => db.transaction(async (trx) => {
  const [result] = await trx.insert(products).values(data).returning({
    id: products.id,
  });

  if (tags?.length) {
    await trx.insert(productTags).values(tags.map((tagId) => ({
      productId: result.id,
      tagId,
    })));
  }

  return result.id;
});

type UpdateProductData = Partial<Omit<typeof products.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>;

export const updateProduct = async (id: number, data: UpdateProductData): Promise<void> => {
  const [result] = await db.update(products).set(data).where(eq(products.id, id)).returning({
    id: products.id,
  });

  if (!result) return notFound();
};

export const deleteProduct = async (id: number): Promise<void> => {
  const [result] = await db.delete(products).where(eq(products.id, id)).returning({
    id: products.id,
  });

  if (!result) return notFound();
};