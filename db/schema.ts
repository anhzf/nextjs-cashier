import { relations } from 'drizzle-orm';
import { boolean, integer, json, pgEnum, pgTableCreator, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const pgTable = pgTableCreator((name) => `cashier_${name}`);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  email: varchar('email').notNull().unique(),
  password: text('password').notNull(),
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

/**
 * Variants are used to store different prices for the same product.
 * 
 * For example, a product "T-Shirt" can have variants like "Size" and "Color".
 * Then the price for each variant can be stored in the following format:
 * {
 *  "Size": {
 *   "S": 10000,
 *   "M": 12000,
 *   "L": 14000,
 *  },
 *  "Color": {
 *   "Red": 10000,
 *   "Green": 10000,
 *   "Blue": 10000,
 *  }
 * }
 * 
 * The specification of product with no variants should be:
 * {
 *  "variant": {
 *   "default": <price>
 *  }
 * }
 */
export interface ProductVariants {
  [variantName: string]: Record<string /* variantValue */, number>;
}

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  variants: json('variants').$type<ProductVariants>()
    .notNull().default({}),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'cancelled', 'suspended']);

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .references(() => customers.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  userId: integer('user_id').notNull()
    .references(() => users.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  // Custom ID provided by the cashier if any
  code: varchar('code'),
  status: transactionStatusEnum('status').notNull().default('pending'),
  statusChangedAt: timestamp('status_changed_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull()
    .references(() => transactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  productId: integer('product_id').notNull()
    .references(() => products.id, { onUpdate: 'cascade' }),
  variantName: varchar('variant_name').notNull(),
  variantValue: varchar('variant_value').notNull(),
  qty: integer('quantity').notNull().default(1),
  // Should be the price at the time of transaction
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (transactionItems) => ({
  unqTransactionProduct: uniqueIndex().on(
    transactionItems.transactionId,
    transactionItems.productId,
    transactionItems.variantName,
    transactionItems.variantValue,
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