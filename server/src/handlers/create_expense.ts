
import { db } from '../db';
import { expensesTable, tripsTable } from '../db/schema';
import { type CreateExpenseInput, type Expense } from '../schema';
import { eq } from 'drizzle-orm';

export const createExpense = async (input: CreateExpenseInput): Promise<Expense> => {
  try {
    // First verify that the trip exists
    const trip = await db.select()
      .from(tripsTable)
      .where(eq(tripsTable.id, input.trip_id))
      .execute();

    if (trip.length === 0) {
      throw new Error(`Trip with ID ${input.trip_id} not found`);
    }

    // Insert expense record
    const result = await db.insert(expensesTable)
      .values({
        name: input.name,
        amount: input.amount.toString(), // Convert number to string for numeric column
        currency: input.currency,
        expense_date: input.expense_date.toISOString().split('T')[0], // Convert Date to string for date column
        category: input.category,
        trip_id: input.trip_id
      })
      .returning()
      .execute();

    // Convert numeric and date fields back to proper types before returning
    const expense = result[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      expense_date: new Date(expense.expense_date) // Convert string back to Date
    };
  } catch (error) {
    console.error('Expense creation failed:', error);
    throw error;
  }
};
