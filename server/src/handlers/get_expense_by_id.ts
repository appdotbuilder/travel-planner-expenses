
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Expense } from '../schema';

export const getExpenseById = async (id: number): Promise<Expense | null> => {
  try {
    const result = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const expense = result[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount), // Convert numeric field to number
      expense_date: new Date(expense.expense_date) // Convert date string to Date object
    };
  } catch (error) {
    console.error('Failed to get expense by ID:', error);
    throw error;
  }
};
