
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable, tripsTable } from '../db/schema';
import { type CreateExpenseInput, type CreateTripInput } from '../schema';
import { createExpense } from '../handlers/create_expense';
import { eq } from 'drizzle-orm';

// Create a test trip first
const createTestTrip = async (): Promise<number> => {
  const testTripInput: CreateTripInput = {
    name: 'Test Trip',
    destination: 'Test Destination',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-01-10'),
    description: 'A test trip',
    participants: 'John, Jane'
  };

  const result = await db.insert(tripsTable)
    .values({
      name: testTripInput.name,
      destination: testTripInput.destination,
      start_date: testTripInput.start_date.toISOString().split('T')[0], // Convert Date to string for date column
      end_date: testTripInput.end_date.toISOString().split('T')[0], // Convert Date to string for date column
      description: testTripInput.description,
      participants: testTripInput.participants
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('createExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an expense', async () => {
    const tripId = await createTestTrip();
    
    const testInput: CreateExpenseInput = {
      name: 'Test Expense',
      amount: 49.99,
      currency: 'USD',
      expense_date: new Date('2024-01-05'),
      category: 'Food',
      trip_id: tripId
    };

    const result = await createExpense(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Expense');
    expect(result.amount).toEqual(49.99);
    expect(typeof result.amount).toBe('number');
    expect(result.currency).toEqual('USD');
    expect(result.expense_date).toEqual(new Date('2024-01-05'));
    expect(result.category).toEqual('Food');
    expect(result.trip_id).toEqual(tripId);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save expense to database', async () => {
    const tripId = await createTestTrip();
    
    const testInput: CreateExpenseInput = {
      name: 'Database Test Expense',
      amount: 25.50,
      currency: 'EUR',
      expense_date: new Date('2024-01-03'),
      category: 'Transport',
      trip_id: tripId
    };

    const result = await createExpense(testInput);

    // Query database to verify expense was saved
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, result.id))
      .execute();

    expect(expenses).toHaveLength(1);
    expect(expenses[0].name).toEqual('Database Test Expense');
    expect(parseFloat(expenses[0].amount)).toEqual(25.50);
    expect(expenses[0].currency).toEqual('EUR');
    expect(new Date(expenses[0].expense_date)).toEqual(new Date('2024-01-03'));
    expect(expenses[0].category).toEqual('Transport');
    expect(expenses[0].trip_id).toEqual(tripId);
    expect(expenses[0].created_at).toBeInstanceOf(Date);
    expect(expenses[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when trip does not exist', async () => {
    const testInput: CreateExpenseInput = {
      name: 'Invalid Trip Expense',
      amount: 15.00,
      currency: 'USD',
      expense_date: new Date('2024-01-05'),
      category: 'Activities',
      trip_id: 999999 // Non-existent trip ID
    };

    await expect(createExpense(testInput)).rejects.toThrow(/trip with id 999999 not found/i);
  });

  it('should handle different expense categories', async () => {
    const tripId = await createTestTrip();
    
    const categories = ['Food', 'Accommodation', 'Transport', 'Activities', 'Other'] as const;
    
    for (const category of categories) {
      const testInput: CreateExpenseInput = {
        name: `${category} Expense`,
        amount: 10.00,
        currency: 'USD',
        expense_date: new Date('2024-01-05'),
        category: category,
        trip_id: tripId
      };

      const result = await createExpense(testInput);
      expect(result.category).toEqual(category);
    }
  });
});
