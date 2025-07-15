
import { serial, text, pgTable, timestamp, numeric, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Expense category enum
export const expenseCategoryEnum = pgEnum('expense_category', ['Food', 'Accommodation', 'Transport', 'Activities', 'Other']);

// Trips table
export const tripsTable = pgTable('trips', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  description: text('description'), // Nullable by default
  participants: text('participants'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Expenses table
export const expensesTable = pgTable('expenses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull(),
  expense_date: date('expense_date').notNull(),
  category: expenseCategoryEnum('category').notNull(),
  trip_id: integer('trip_id').notNull().references(() => tripsTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const tripsRelations = relations(tripsTable, ({ many }) => ({
  expenses: many(expensesTable),
}));

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  trip: one(tripsTable, {
    fields: [expensesTable.trip_id],
    references: [tripsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Trip = typeof tripsTable.$inferSelect;
export type NewTrip = typeof tripsTable.$inferInsert;
export type Expense = typeof expensesTable.$inferSelect;
export type NewExpense = typeof expensesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  trips: tripsTable, 
  expenses: expensesTable 
};
