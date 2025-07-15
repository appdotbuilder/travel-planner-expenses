
import { z } from 'zod';

// Trip schema
export const tripSchema = z.object({
  id: z.number(),
  name: z.string(),
  destination: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  description: z.string().nullable(),
  participants: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Trip = z.infer<typeof tripSchema>;

// Input schema for creating trips
export const createTripInputSchema = z.object({
  name: z.string().min(1, "Trip name is required"),
  destination: z.string().min(1, "Destination is required"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  description: z.string().nullable(),
  participants: z.string().nullable()
}).refine(data => data.end_date >= data.start_date, {
  message: "End date must be after or equal to start date",
  path: ["end_date"]
});

export type CreateTripInput = z.infer<typeof createTripInputSchema>;

// Input schema for updating trips
export const updateTripInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Trip name is required").optional(),
  destination: z.string().min(1, "Destination is required").optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  description: z.string().nullable().optional(),
  participants: z.string().nullable().optional()
}).refine(data => {
  if (data.start_date && data.end_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: "End date must be after or equal to start date",
  path: ["end_date"]
});

export type UpdateTripInput = z.infer<typeof updateTripInputSchema>;

// Expense category enum
export const expenseCategoryEnum = z.enum(['Food', 'Accommodation', 'Transport', 'Activities', 'Other']);
export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

// Expense schema
export const expenseSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  expense_date: z.coerce.date(),
  category: expenseCategoryEnum,
  trip_id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Expense = z.infer<typeof expenseSchema>;

// Input schema for creating expenses
export const createExpenseInputSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required"),
  expense_date: z.coerce.date(),
  category: expenseCategoryEnum,
  trip_id: z.number().int().positive("Trip ID is required")
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

// Input schema for updating expenses
export const updateExpenseInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Expense name is required").optional(),
  amount: z.number().positive("Amount must be positive").optional(),
  currency: z.string().min(1, "Currency is required").optional(),
  expense_date: z.coerce.date().optional(),
  category: expenseCategoryEnum.optional(),
  trip_id: z.number().int().positive("Trip ID is required").optional()
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

// Schema for getting expenses by trip
export const getExpensesByTripInputSchema = z.object({
  trip_id: z.number().int().positive("Trip ID is required")
});

export type GetExpensesByTripInput = z.infer<typeof getExpensesByTripInputSchema>;

// Schema for deleting records
export const deleteInputSchema = z.object({
  id: z.number().int().positive("ID is required")
});

export type DeleteInput = z.infer<typeof deleteInputSchema>;
