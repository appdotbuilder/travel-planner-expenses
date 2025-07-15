
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteExpense = async (input: DeleteInput): Promise<{ success: boolean }> => {
  try {
    // Delete the expense record
    const result = await db.delete(expensesTable)
      .where(eq(expensesTable.id, input.id))
      .returning()
      .execute();

    // Return success status based on whether a record was deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Expense deletion failed:', error);
    throw error;
  }
};
