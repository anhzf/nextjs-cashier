import { relations } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

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
  email: varchar('email').unique(),
  phone: varchar('phone'),
  address: text('address'),
  type: varchar('type'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (customers) => ({
  unqEmail: uniqueIndex().on(customers.email),
}));

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  brand: varchar('brand'),
  type: varchar('type'),
  size: varchar('size'),
  price: integer('price'),
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
  qty: integer('quantity').notNull().default(1),
  // Should be the price at the time of transaction
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (transactionItems) => ({
  unqTransactionProduct: uniqueIndex().on(transactionItems.transactionId, transactionItems.productId),
}));

export const transactionsRelations = relations(transactions, ({ many, one }) => ({
  cashier: one(users),
  customer: one(customers),
  items: many(transactionItems),
}));
