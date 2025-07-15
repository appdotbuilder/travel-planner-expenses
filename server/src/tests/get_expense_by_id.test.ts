
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable, expensesTable } from '../db/schema';
import { getExpenseById } from '../handlers/get_expense_by_id';

// Test data
const testTrip = {
  name: 'Test Trip',
  destination: 'Test Destination',
  start_date: '2024-01-01',
  end_date: '2024-01-07',
  description: 'Test trip description',
  participants: 'Test participants'
};

const testExpense = {
  name: 'Test Expense',
  amount: '99.99',
  currency: 'USD',
  expense_date: '2024-01-02',
  category: 'Food' as const,
  trip_id: 1 // Will be updated with actual trip ID
};

describe('getExpenseById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return expense when found', async () => {
    // Create a trip first
    const tripResult = await db.insert(tripsTable)
      .values(testTrip)
      .returning()
      .execute();

    const tripId = tripResult[0].id;

    // Create an expense
    const expenseResult = await db.insert(expensesTable)
      .values({
        ...testExpense,
        trip_id: tripId
      })
      .returning()
      .execute();

    const expenseId = expenseResult[0].id;

    // Test the handler
    const result = await getExpenseById(expenseId);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(expenseId);
    expect(result!.name).toEqual('Test Expense');
    expect(result!.amount).toEqual(99.99);
    expect(typeof result!.amount).toBe('number');
    expect(result!.currency).toEqual('USD');
    expect(result!.expense_date).toBeInstanceOf(Date);
    expect(result!.category).toEqual('Food');
    expect(result!.trip_id).toEqual(tripId);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when expense not found', async () => {
    const result = await getExpenseById(999);

    expect(result).toBeNull();
  });

  it('should handle numeric amount conversion correctly', async () => {
    // Create a trip first
    const tripResult = await db.insert(tripsTable)
      .values(testTrip)
      .returning()
      .execute();

    const tripId = tripResult[0].id;

    // Create an expense with decimal amount
    const expenseResult = await db.insert(expensesTable)
      .values({
        ...testExpense,
        amount: '123.45',
        trip_id: tripId
      })
      .returning()
      .execute();

    const expenseId = expenseResult[0].id;

    // Test the handler
    const result = await getExpenseById(expenseId);

    expect(result).not.toBeNull();
    expect(result!.amount).toEqual(123.45);
    expect(typeof result!.amount).toBe('number');
  });
});
