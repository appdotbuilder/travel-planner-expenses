
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type GetExpensesByTripInput, type Expense } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getExpensesByTrip = async (input: GetExpensesByTripInput): Promise<Expense[]> => {
  try {
    // Query expenses for the specific trip, ordered by expense date
    const results = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.trip_id, input.trip_id))
      .orderBy(asc(expensesTable.expense_date))
      .execute();

    // Convert numeric fields and date fields back to proper types before returning
    return results.map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      expense_date: new Date(expense.expense_date) // Convert string back to Date
    }));
  } catch (error) {
    console.error('Failed to fetch expenses by trip:', error);
    throw error;
  }
};
