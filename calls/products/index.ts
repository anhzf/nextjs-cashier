'use server';

import { db } from '@/db';
import { products, productTags } from '@/db/schema';
import { pick } from '@/utils/object';
import { and, asc, desc, eq, exists, inArray } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ALLOWED_PRODUCT_INSERT_FIELDS, ALLOWED_PRODUCT_UPDATE_FIELDS, DEFAULT_LIST_PRODUCTS_QUERY, ProductSortByMap, type ListProductQuery } from './constants';

type Product = typeof products.$inferSelect;

export async function listProduct(query?: ListProductQuery) {
  const mergedQuery = { ...DEFAULT_LIST_PRODUCTS_QUERY, ...query };
  const { limit, start, showHidden, sortBy, sort, tag } = mergedQuery;

  const results = await db.query.products.findMany({
    where: (table) => and(
      (showHidden === false) ? eq(products.isHidden, false) : undefined,
      (typeof tag === 'number') ? exists(
        db.select()
          .from(productTags)
          .where(
            and(
              eq(productTags.productId, table.id),
              eq(productTags.tagId, tag),
            ),
          ),
      ) : undefined,
    ),
    orderBy: sort === 'desc' ? desc(ProductSortByMap[sortBy]) : asc(ProductSortByMap[sortBy]),
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

export async function getProduct(id: number) {
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

type CreateProductData = Pick<typeof products.$inferInsert, typeof ALLOWED_PRODUCT_INSERT_FIELDS[number]>
  & {
    tags?: {
      id: number;
    }[]
  };

export async function createProduct({ tags, ...data }: CreateProductData): Promise<number> {
  return db.transaction(async (trx) => {
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
}


type UpdateProductData = Partial<Pick<typeof products.$inferInsert, typeof ALLOWED_PRODUCT_UPDATE_FIELDS[number]>>
  & {
    tags?: {
      id: number;
      type: 'add' | 'remove';
    }[]
  };

export async function updateProduct(id: number, { tags, ...data }: UpdateProductData): Promise<void> {
  return db.transaction(async (trx) => {
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
}

export async function deleteProduct(id: number): Promise<void> {
  const [result] = await db.delete(products).where(eq(products.id, id)).returning({
    id: products.id,
  });

  if (!result) return notFound();
};