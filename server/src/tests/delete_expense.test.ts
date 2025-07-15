
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable, expensesTable } from '../db/schema';
import { type DeleteInput } from '../schema';
import { deleteExpense } from '../handlers/delete_expense';
import { eq } from 'drizzle-orm';

// Test input
const testDeleteInput: DeleteInput = {
  id: 1
};

describe('deleteExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an expense successfully', async () => {
    // Create a trip first
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();

    // Create an expense to delete
    const expenseResult = await db.insert(expensesTable)
      .values({
        name: 'Test Expense',
        amount: '100.50',
        currency: 'USD',
        expense_date: '2024-01-02',
        category: 'Food',
        trip_id: tripResult[0].id
      })
      .returning()
      .execute();

    const result = await deleteExpense({ id: expenseResult[0].id });

    expect(result.success).toBe(true);

    // Verify the expense was deleted from database
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, expenseResult[0].id))
      .execute();

    expect(expenses).toHaveLength(0);
  });

  it('should return false when expense does not exist', async () => {
    const result = await deleteExpense({ id: 999 });

    expect(result.success).toBe(false);
  });

  it('should not affect other expenses when deleting one', async () => {
    // Create a trip first
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-07',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();

    // Create two expenses
    const expense1Result = await db.insert(expensesTable)
      .values({
        name: 'Expense 1',
        amount: '50.00',
        currency: 'USD',
        expense_date: '2024-01-02',
        category: 'Food',
        trip_id: tripResult[0].id
      })
      .returning()
      .execute();

    const expense2Result = await db.insert(expensesTable)
      .values({
        name: 'Expense 2',
        amount: '75.25',
        currency: 'USD',
        expense_date: '2024-01-03',
        category: 'Transport',
        trip_id: tripResult[0].id
      })
      .returning()
      .execute();

    // Delete first expense
    const result = await deleteExpense({ id: expense1Result[0].id });

    expect(result.success).toBe(true);

    // Verify only the first expense was deleted
    const expense1Check = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, expense1Result[0].id))
      .execute();

    const expense2Check = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, expense2Result[0].id))
      .execute();

    expect(expense1Check).toHaveLength(0);
    expect(expense2Check).toHaveLength(1);
    expect(expense2Check[0].name).toEqual('Expense 2');
  });
});
