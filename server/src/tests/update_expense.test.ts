
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable, tripsTable } from '../db/schema';
import { type UpdateExpenseInput } from '../schema';
import { updateExpense } from '../handlers/update_expense';
import { eq } from 'drizzle-orm';

describe('updateExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an expense with all fields', async () => {
    // Create prerequisite trip
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();
    const tripId = tripResult[0].id;

    // Create expense to update
    const expenseResult = await db.insert(expensesTable)
      .values({
        name: 'Original Expense',
        amount: '50.00',
        currency: 'USD',
        expense_date: '2024-01-01',
        category: 'Food',
        trip_id: tripId
      })
      .returning()
      .execute();
    const expenseId = expenseResult[0].id;

    // Update the expense
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      name: 'Updated Expense',
      amount: 75.50,
      currency: 'EUR',
      expense_date: new Date('2024-01-02'),
      category: 'Transport',
      trip_id: tripId
    };

    const result = await updateExpense(updateInput);

    // Verify updated fields
    expect(result.id).toEqual(expenseId);
    expect(result.name).toEqual('Updated Expense');
    expect(result.amount).toEqual(75.50);
    expect(result.currency).toEqual('EUR');
    expect(result.expense_date).toEqual(new Date('2024-01-02'));
    expect(result.category).toEqual('Transport');
    expect(result.trip_id).toEqual(tripId);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create prerequisite trip
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();
    const tripId = tripResult[0].id;

    // Create expense to update
    const expenseResult = await db.insert(expensesTable)
      .values({
        name: 'Original Expense',
        amount: '50.00',
        currency: 'USD',
        expense_date: '2024-01-01',
        category: 'Food',
        trip_id: tripId
      })
      .returning()
      .execute();
    const expenseId = expenseResult[0].id;

    // Update only name and amount
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      name: 'Partially Updated Expense',
      amount: 100.00
    };

    const result = await updateExpense(updateInput);

    // Verify only specified fields were updated
    expect(result.name).toEqual('Partially Updated Expense');
    expect(result.amount).toEqual(100.00);
    expect(result.currency).toEqual('USD'); // Should remain unchanged
    expect(result.expense_date).toEqual(new Date('2024-01-01')); // Should remain unchanged
    expect(result.category).toEqual('Food'); // Should remain unchanged
    expect(result.trip_id).toEqual(tripId); // Should remain unchanged
  });

  it('should persist changes to database', async () => {
    // Create prerequisite trip
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();
    const tripId = tripResult[0].id;

    // Create expense to update
    const expenseResult = await db.insert(expensesTable)
      .values({
        name: 'Original Expense',
        amount: '50.00',
        currency: 'USD',
        expense_date: '2024-01-01',
        category: 'Food',
        trip_id: tripId
      })
      .returning()
      .execute();
    const expenseId = expenseResult[0].id;

    // Update the expense
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      name: 'Database Updated Expense',
      amount: 200.00
    };

    await updateExpense(updateInput);

    // Verify changes were persisted
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, expenseId))
      .execute();

    expect(expenses).toHaveLength(1);
    expect(expenses[0].name).toEqual('Database Updated Expense');
    expect(parseFloat(expenses[0].amount)).toEqual(200.00);
  });

  it('should throw error when expense not found', async () => {
    const updateInput: UpdateExpenseInput = {
      id: 999,
      name: 'Non-existent Expense'
    };

    await expect(updateExpense(updateInput)).rejects.toThrow(/expense with id 999 not found/i);
  });

  it('should throw error when trip_id does not exist', async () => {
    // Create prerequisite trip
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();
    const tripId = tripResult[0].id;

    // Create expense to update
    const expenseResult = await db.insert(expensesTable)
      .values({
        name: 'Original Expense',
        amount: '50.00',
        currency: 'USD',
        expense_date: '2024-01-01',
        category: 'Food',
        trip_id: tripId
      })
      .returning()
      .execute();
    const expenseId = expenseResult[0].id;

    // Try to update with non-existent trip_id
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      trip_id: 999
    };

    await expect(updateExpense(updateInput)).rejects.toThrow(/trip with id 999 not found/i);
  });

  it('should handle numeric amount conversions correctly', async () => {
    // Create prerequisite trip
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Test description',
        participants: 'Test participants'
      })
      .returning()
      .execute();
    const tripId = tripResult[0].id;

    // Create expense to update
    const expenseResult = await db.insert(expensesTable)
      .values({
        name: 'Original Expense',
        amount: '50.00',
        currency: 'USD',
        expense_date: '2024-01-01',
        category: 'Food',
        trip_id: tripId
      })
      .returning()
      .execute();
    const expenseId = expenseResult[0].id;

    // Update with decimal amount
    const updateInput: UpdateExpenseInput = {
      id: expenseId,
      amount: 123.45
    };

    const result = await updateExpense(updateInput);

    // Verify numeric conversion
    expect(typeof result.amount).toBe('number');
    expect(result.amount).toEqual(123.45);
  });
});
