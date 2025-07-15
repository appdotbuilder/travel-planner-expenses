
import { db } from '../db';
import { expensesTable, tripsTable } from '../db/schema';
import { type UpdateExpenseInput, type Expense } from '../schema';
import { eq } from 'drizzle-orm';

export const updateExpense = async (input: UpdateExpenseInput): Promise<Expense> => {
  try {
    // First, verify the expense exists
    const existingExpense = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, input.id))
      .execute();

    if (existingExpense.length === 0) {
      throw new Error(`Expense with id ${input.id} not found`);
    }

    // If trip_id is being updated, verify it exists
    if (input.trip_id) {
      const tripExists = await db.select()
        .from(tripsTable)
        .where(eq(tripsTable.id, input.trip_id))
        .execute();

      if (tripExists.length === 0) {
        throw new Error(`Trip with id ${input.trip_id} not found`);
      }
    }

    // Build update values, only including provided fields
    const updateValues: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateValues.name = input.name;
    }
    if (input.amount !== undefined) {
      updateValues.amount = input.amount.toString(); // Convert number to string for numeric column
    }
    if (input.currency !== undefined) {
      updateValues.currency = input.currency;
    }
    if (input.expense_date !== undefined) {
      updateValues.expense_date = input.expense_date.toISOString().split('T')[0]; // Convert Date to string
    }
    if (input.category !== undefined) {
      updateValues.category = input.category;
    }
    if (input.trip_id !== undefined) {
      updateValues.trip_id = input.trip_id;
    }

    // Update the expense
    const result = await db.update(expensesTable)
      .set(updateValues)
      .where(eq(expensesTable.id, input.id))
      .returning()
      .execute();

    // Convert fields back to proper types before returning
    const expense = result[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      expense_date: new Date(expense.expense_date), // Convert string back to Date
      created_at: new Date(expense.created_at), // Convert string back to Date
      updated_at: new Date(expense.updated_at) // Convert string back to Date
    };
  } catch (error) {
    console.error('Expense update failed:', error);
    throw error;
  }
};
