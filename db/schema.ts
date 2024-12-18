import { TRANSACTION_STATUSES } from '@/constants';
import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgEnum, pgTableCreator, primaryKey, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const pgTable = pgTableCreator((name) => `cashier_${name}`);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  password: text('password').notNull(),
  config: jsonb('config').$type<{ notifications: Record<string, boolean> }>()
    .notNull().default({ notifications: {} }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (users) => ({
  unqEmail: uniqueIndex().on(users.email),
}));

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  phone: varchar('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (tags) => ({
  unqName: uniqueIndex().on(tags.name),
}));

export interface VariantAttributes {
  price: number;
  group?: string;
}

export interface ProductVariants {
  [variantName: string]: VariantAttributes;
}

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  variants: jsonb('variants').$type<ProductVariants>().notNull(),
  stock: integer('stock').notNull().default(0),
  unit: varchar('unit').notNull().default('pcs'),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productTags = pgTable('product_tags', {
  productId: integer('product_id').notNull()
    .references(() => products.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  tagId: integer('tag_id').notNull()
    .references(() => tags.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (productTags) => ({
  pk: primaryKey({ columns: [productTags.productId, productTags.tagId] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  tags: many(productTags),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

export const transactionStatusEnum = pgEnum('transaction_status', TRANSACTION_STATUSES);

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  // If the transaction is stocking up the inventory
  isStocking: boolean('is_stocking').notNull().default(false),
  customerId: integer('customer_id')
    .references(() => customers.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  userId: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  // Custom ID provided by the cashier if any
  code: varchar('code'),
  status: transactionStatusEnum('status').notNull().default('pending'),
  statusChangedAt: timestamp('status_changed_at').notNull().defaultNow(),
  // The due date for the transaction for "pending" status only
  dueDate: timestamp('due_date'),
  // Support for partial payment
  // When the transaction is "completed", the paid amount should be equal to the total amount
  paid: integer('paid').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull()
    .references(() => transactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  productId: integer('product_id').notNull()
    .references(() => products.id, { onUpdate: 'cascade' }),
  variant: varchar('variant').notNull(),
  qty: integer('quantity').notNull().default(1),
  // Should be the price at the time of transaction
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (transactionItems) => ({
  unqTransactionProduct: uniqueIndex().on(
    transactionItems.transactionId,
    transactionItems.productId,
    transactionItems.variant,
  ),
}));

export const transactionsRelations = relations(transactions, ({ many, one }) => ({
  cashier: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  items: many(transactionItems),
}));

export const transactionItemsRelations = relations(transactionItems, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionItems.transactionId],
    references: [transactions.id],
  }),
  product: one(products, {
    fields: [transactionItems.productId],
    references: [products.id],
  }),
}));