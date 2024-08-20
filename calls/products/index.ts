import { db } from '@/db';
import { products, productTags } from '@/db/schema';
import { pick } from '@/utils/object';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
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

export const listProduct = async (query?: ListProductQuery) => {
  const { limit, start, showHidden, sortBy, sort } = { ...DEFAULT_LIST_PRODUCTS_QUERY, ...query };

  const results = await db.query.products.findMany({
    where: (showHidden === false) ? eq(products.isHidden, false) : undefined,
    orderBy: sort === 'desc' ? desc(sortByMap[sortBy]) : asc(sortByMap[sortBy]),
    limit,
    offset: start,
    with: {
      tags: {
        columns: {
          tagId: false,
          productId: false,
        },
        with: {
          tag: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return results;
};

export const getProduct = async (id: number) => {
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

const ALLOWED_PRODUCT_INSERT_FIELDS = ['name', 'variants', 'unit', 'isHidden'] satisfies (keyof typeof products.$inferInsert)[];

type CreateProductData = Pick<typeof products.$inferInsert, typeof ALLOWED_PRODUCT_INSERT_FIELDS[number]>
  & {
    tags?: {
      id: number;
    }[]
  };

export const createProduct = async ({ tags, ...data }: CreateProductData): Promise<number> => db.transaction(async (trx) => {
  const insertData = pick(data, ...ALLOWED_PRODUCT_INSERT_FIELDS);
  const [result] = await trx.insert(products).values(insertData).returning({
    id: products.id,
  });

  if (tags?.length) {
    await trx.insert(productTags).values(tags.map(({ id: tagId }) => ({
      productId: result.id,
      tagId,
    })));
  }

  return result.id;
});

const ALLOWED_PRODUCT_UPDATE_FIELDS = ['name', 'variants', 'isHidden', 'unit'] satisfies (keyof typeof products.$inferInsert)[];

type UpdateProductData = Partial<Pick<typeof products.$inferInsert, typeof ALLOWED_PRODUCT_UPDATE_FIELDS[number]>>
  & {
    tags?: {
      id: number;
      type: 'add' | 'remove';
    }[]
  };

export const updateProduct = async (id: number, { tags, ...data }: UpdateProductData): Promise<void> => db.transaction(async (trx) => {
  const productUpdate = {
    ...pick(data, ...ALLOWED_PRODUCT_UPDATE_FIELDS),
    updatedAt: new Date(),
  };

  const updates: Promise<any>[] = [];

  const updateResults = trx.update(products).set(productUpdate).where(eq(products.id, id)).returning({
    id: products.id,
  });
  updates.push(updateResults);

  if (tags?.length) {
    const tagAdds = tags.filter(({ type }) => type === 'add').map(({ id: tagId }) => ({
      productId: id,
      tagId,
    }));
    const tagRemoves = tags.filter(({ type }) => type === 'remove').map(({ id }) => id);

    if (tagAdds.length) updates.push(trx.insert(productTags).values(tagAdds).onConflictDoNothing());
    if (tagRemoves.length) updates.push(trx.delete(productTags).where(and(
      eq(productTags.productId, id),
      inArray(productTags.tagId, tagRemoves),
    )));
  }

  await Promise.all(updates);

  const [result] = await updateResults;
  if (!result) return notFound();
});

export const deleteProduct = async (id: number): Promise<void> => {
  const [result] = await db.delete(products).where(eq(products.id, id)).returning({
    id: products.id,
  });

  if (!result) return notFound();
};