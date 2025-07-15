
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable, expensesTable } from '../db/schema';
import { getExpenses } from '../handlers/get_expenses';

describe('getExpenses', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no expenses exist', async () => {
    const result = await getExpenses();
    expect(result).toEqual([]);
  });

  it('should return all expenses', async () => {
    // Create test trip first
    const trip = await db.insert(tripsTable)
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

    // Create test expenses
    await db.insert(expensesTable)
      .values([
        {
          name: 'Hotel',
          amount: '100.50',
          currency: 'USD',
          expense_date: '2024-01-01',
          category: 'Accommodation',
          trip_id: trip[0].id
        },
        {
          name: 'Dinner',
          amount: '25.75',
          currency: 'USD',
          expense_date: '2024-01-02',
          category: 'Food',
          trip_id: trip[0].id
        }
      ])
      .execute();

    const result = await getExpenses();

    expect(result).toHaveLength(2);
    
    // Check first expense (should be ordered by date desc)
    expect(result[0].name).toEqual('Dinner');
    expect(result[0].amount).toEqual(25.75);
    expect(typeof result[0].amount).toEqual('number');
    expect(result[0].currency).toEqual('USD');
    expect(result[0].category).toEqual('Food');
    expect(result[0].trip_id).toEqual(trip[0].id);
    expect(result[0].expense_date).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // Check second expense
    expect(result[1].name).toEqual('Hotel');
    expect(result[1].amount).toEqual(100.50);
    expect(typeof result[1].amount).toEqual('number');
    expect(result[1].currency).toEqual('USD');
    expect(result[1].category).toEqual('Accommodation');
    expect(result[1].trip_id).toEqual(trip[0].id);
    expect(result[1].expense_date).toBeInstanceOf(Date);
  });

  it('should order expenses by expense date descending', async () => {
    // Create test trip
    const trip = await db.insert(tripsTable)
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

    // Create expenses with different dates
    await db.insert(expensesTable)
      .values([
        {
          name: 'Old Expense',
          amount: '50.00',
          currency: 'USD',
          expense_date: '2024-01-01',
          category: 'Food',
          trip_id: trip[0].id
        },
        {
          name: 'New Expense',
          amount: '75.00',
          currency: 'USD',
          expense_date: '2024-01-03',
          category: 'Transport',
          trip_id: trip[0].id
        },
        {
          name: 'Middle Expense',
          amount: '60.00',
          currency: 'USD',
          expense_date: '2024-01-02',
          category: 'Activities',
          trip_id: trip[0].id
        }
      ])
      .execute();

    const result = await getExpenses();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('New Expense');
    expect(result[1].name).toEqual('Middle Expense');
    expect(result[2].name).toEqual('Old Expense');
    
    // Verify dates are in descending order
    expect(result[0].expense_date >= result[1].expense_date).toBe(true);
    expect(result[1].expense_date >= result[2].expense_date).toBe(true);
  });
});
