import { db } from '@/db';
import { products, transactionItems, transactions, type transactionStatusEnum } from '@/db/schema';
import type { DbTransaction } from '@/types/db';
import { badRequest } from '@/utils/errors';
import { pick } from '@/utils/object';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { type PgColumn } from 'drizzle-orm/pg-core';
import { notFound } from 'next/navigation';

type Transaction = typeof transactions.$inferSelect;

const sortByMap = {
  status: transactions.status,
  createdAt: transactions.createdAt,
  updatedAt: transactions.updatedAt,
} satisfies Partial<Record<keyof Transaction, PgColumn>>;

export interface ListTransactionQuery {
  limit?: number;
  start?: number;
  sortBy?: keyof typeof sortByMap;
  sort?: 'asc' | 'desc';
  status?: typeof transactionStatusEnum.enumValues[number];
}

const DEFAULT_LIST_TRANSACTIONS_QUERY = {
  limit: 10,
  start: 0,
  sortBy: 'createdAt',
  sort: 'desc',
} satisfies ListTransactionQuery;

export const LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY = Object.keys(sortByMap) as (keyof typeof sortByMap)[];

export const listTransaction = async (query?: ListTransactionQuery) => {
  const { limit, start, sortBy, sort, status } = { ...DEFAULT_LIST_TRANSACTIONS_QUERY, ...query };

  const results = await db.query.transactions.findMany({
    where: and(
      eq(transactions.isStocking, false),
      status && eq(transactions.status, status),
    ),
    orderBy: sort === 'desc' ? desc(sortByMap[sortBy]) : asc(sortByMap[sortBy]),
    limit,
    offset: start,
  });

  return results;
};

export const getTransaction = async (id: number) => {
  const result = await db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    columns: {
      userId: false,
      customerId: false,
    },
    with: {
      cashier: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      customer: {
        columns: {
          id: true,
          name: true,
        },
      },
      items: {
        columns: {
          transactionId: false,
          productId: false,
          updatedAt: false,
          createdAt: false,
        },
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              variants: true,
            },
          },
        },
      },
    },
  });

  if (!result) return notFound();

  return result;
};

const ALLOWED_TRANSACTION_INSERT_FIELDS = [
  'userId', 'customerId', 'code', 'dueDate', 'paid', 'isStocking',
] satisfies (keyof typeof transactions.$inferInsert)[];

const REQUIRED_TRANSACTION_ITEM_INSERT_FIELDS = [
  'productId', 'variant',
] satisfies (keyof typeof transactionItems.$inferInsert)[];

const OPTIONAL_TRANSACTION_ITEM_INSERT_FIELDS = [
  'price', 'qty',
] satisfies (keyof typeof transactionItems.$inferInsert)[];

type InsertTransaction = Pick<typeof transactions.$inferInsert, typeof ALLOWED_TRANSACTION_INSERT_FIELDS[number]>;

type InsertTransactionItem = Pick<typeof transactionItems.$inferInsert, typeof REQUIRED_TRANSACTION_ITEM_INSERT_FIELDS[number]>
  & Partial<Pick<typeof transactionItems.$inferInsert, typeof OPTIONAL_TRANSACTION_ITEM_INSERT_FIELDS[number]>>;

type CreateTransactionData = InsertTransaction & {
  items: InsertTransactionItem[];
};

/** Verify if the items inside transaction able to update  */
const verifyTransactionItemsUpdateAvailability = async (id: number, trx?: DbTransaction): Promise<void> => {
  const _ = trx ?? db;

  const transaction = await _.query.transactions.findFirst({
    where: eq(transactions.id, id),
    columns: { status: true },
  });

  if (!transaction) return notFound();
  if (transaction.status !== 'pending') return badRequest(
    `Adding items to transaction with status '${transaction.status}' is not allowed.`
  );
};

interface UpdateItemsInTransactionData {
  id: number;
  items: InsertTransactionItem[];
  isStocking?: boolean;
}

const _updateItemsInTransaction = async ({ id, items, isStocking = false }: UpdateItemsInTransactionData, trx?: DbTransaction): Promise<void> => {
  const _ = trx ?? db;

  await verifyTransactionItemsUpdateAvailability(id, trx);

  const validatedItems = items.map((item) => pick(item, ...REQUIRED_TRANSACTION_ITEM_INSERT_FIELDS, ...OPTIONAL_TRANSACTION_ITEM_INSERT_FIELDS));

  const existingItems = await _.query.transactionItems.findMany({
    where: and(
      eq(transactionItems.transactionId, id),
      inArray(transactionItems.productId, validatedItems.map((item) => item.productId)),
    ),
    columns: {
      id: true,
      productId: true,
      price: true,
      qty: true,
    },
  });

  // Get references of products to get the price
  const priceReferences = await _.query.products.findMany({
    where: inArray(products.id, [...existingItems, ...validatedItems]
      .filter((item) => item.price === undefined)
      .map((item) => item.productId)),
    columns: {
      id: true,
      name: true,
      variants: true,
      stock: true,
    },
  });

  const findPrice = (productId: number, variant: string) => {
    const price = priceReferences.find((product) => product.id === productId)
      ?.variants[variant].price;

    if (price === undefined) {
      throw new Error(`Price for product ${productId} with variant ${variant} not found`);
    }

    return price;
  };

  // Pick items that not exists in transactionItems
  const insertedItems = validatedItems
    .filter((item) => existingItems.findIndex((existing) => (existing.productId === item.productId)) === -1)
    .map((item) => ({
      ...item,
      price: item.price ?? findPrice(item.productId, item.variant),
      transactionId: id
    }));

  // Pick items that exists in transactionItems
  const updatedItems = validatedItems
    .filter((item) => existingItems.findIndex((existing) => (existing.productId === item.productId)) !== -1)
    .map((item) => ({
      ...item,
      id: existingItems.find((existing) => existing.id)!.id,
      price: item.price ?? findPrice(item.productId, item.variant),
      transactionId: id,
    }));

  // console.log({ insertedItems, updatedItems });

  const queries = [
    // Insert new items to transaction
    insertedItems.length
      ? _.insert(transactionItems).values(insertedItems)
      : undefined,

    // Update existing items in transaction
    ...updatedItems.map(({ transactionId, productId, id, ...item }) => _
      .update(transactionItems).set({
        ...item,
        updatedAt: new Date(),
      })
      .where(eq(transactionItems.id, id))
    ),

    // Update stock
    ...insertedItems.map((item) => {
      const { name, stock } = priceReferences.find((product) => product.id === item.productId)!;
      const stockDelta = isStocking ? (item.qty ?? 1) : -(item.qty ?? 1);
      const finalStock = stock + stockDelta;
      console.log({ name, isStocking, stock, stockDelta, finalStock });
      if (finalStock < 0) throw new Error(`Insufficient stock for product ${name} [${item.productId}]`);

      return _.update(products)
        .set({ stock: stockDelta })
        .where(eq(products.id, item.productId));
    }),
    ...updatedItems.map((item) => {
      const { name, stock } = priceReferences.find((product) => product.id === item.productId)!;
      const before = existingItems.find((existing) => existing.id === item.id)!;
      const qtyDiff = (item.qty ?? 1) - before.qty;
      const stockDelta = isStocking ? qtyDiff : -qtyDiff;
      const finalStock = stock + stockDelta;
      console.log({ name, isStocking, before: before.qty, setTo: item.qty ?? 1, stock, stockDelta, finalStock });
      if (finalStock < 0) throw new Error(`Insufficient stock for product ${name} [${item.productId}]`);

      return _.update(products)
        .set({ stock: finalStock })
        .where(eq(products.id, item.productId));
    }),
  ];

  await Promise.all(queries);
};

// TODO: Able to create transaction with status completed
export const createTransaction = async ({ items, ...data }: CreateTransactionData): Promise<number> => db
  .transaction(async (trx) => {
    const [transaction] = await trx.insert(transactions).values(
      pick(data, ...ALLOWED_TRANSACTION_INSERT_FIELDS),
    ).returning({
      id: transactions.id,
    });

    await _updateItemsInTransaction({ id: transaction.id, items, isStocking: data.isStocking }, trx);

    return transaction.id;
  });

const ALLOWED_TRANSACTION_UPDATE_FIELDS = ['status', 'code', 'paid', 'dueDate'] satisfies (keyof typeof transactions.$inferInsert)[];

type UpdateTransaction = Pick<typeof transactions.$inferInsert, typeof ALLOWED_TRANSACTION_UPDATE_FIELDS[number]>;

type UpdateTransactionData = UpdateTransaction;

export const updateTransaction = async (id: number, data: UpdateTransactionData): Promise<void> => {
  const [result] = await db.update(transactions).set(
    pick({
      ...data,
      statusChangedAt: data.status && new Date(),
      updatedAt: new Date(),
    }, ...ALLOWED_TRANSACTION_UPDATE_FIELDS),
  ).where(eq(transactions.id, id)).returning({
    id: transactions.id,
  });

  if (!result) return notFound();
};

export const deleteTransaction = async (id: number): Promise<void> => {
  const [result] = await db.delete(transactions).where(eq(transactions.id, id)).returning({
    id: transactions.id,
  });

  if (!result) return notFound();
};

export const addItemsToTransaction = async (id: number, items: InsertTransactionItem[]): Promise<void> => {
  await _updateItemsInTransaction({ id, items });
};

type UpdateTransactionItem = Omit<Partial<InsertTransactionItem>, 'productId' | 'variant'>;

export const updateTransactionItem = async (id: number, itemId: number, data: UpdateTransactionItem): Promise<void> => db.transaction(async (trx) => {
  await verifyTransactionItemsUpdateAvailability(id, trx);

  const [result] = await trx.update(transactionItems).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(transactionItems.id, itemId)).returning({
    id: transactionItems.id,
  });

  if (!result) return notFound();
});

export const deleteTransactionItem = async (id: number, itemId: number): Promise<void> => db.transaction(async (trx) => {
  await verifyTransactionItemsUpdateAvailability(id, trx);

  const [result] = await trx.delete(transactionItems).where(eq(transactionItems.id, itemId)).returning({
    id: transactionItems.id,
  });

  if (!result) return notFound();
});