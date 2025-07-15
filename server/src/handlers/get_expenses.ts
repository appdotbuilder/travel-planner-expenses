
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type Expense } from '../schema';
import { desc } from 'drizzle-orm';

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const results = await db.select()
      .from(expensesTable)
      .orderBy(desc(expensesTable.expense_date))
      .execute();

    // Convert numeric fields back to numbers and date fields to Date objects
    return results.map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount),
      expense_date: new Date(expense.expense_date)
    }));
  } catch (error) {
    console.error('Failed to get expenses:', error);
    throw error;
  }
};
