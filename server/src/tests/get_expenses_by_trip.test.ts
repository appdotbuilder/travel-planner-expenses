
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tripsTable, expensesTable } from '../db/schema';
import { type GetExpensesByTripInput } from '../schema';
import { getExpensesByTrip } from '../handlers/get_expenses_by_trip';

describe('getExpensesByTrip', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return expenses for a specific trip', async () => {
    // Create a trip first
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Test Trip',
        destination: 'Test Destination',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Test description',
        participants: 'John, Jane'
      })
      .returning()
      .execute();

    const tripId = tripResult[0].id;

    // Create test expenses
    await db.insert(expensesTable)
      .values([
        {
          name: 'Hotel',
          amount: '150.00',
          currency: 'USD',
          expense_date: '2024-01-02',
          category: 'Accommodation',
          trip_id: tripId
        },
        {
          name: 'Restaurant',
          amount: '75.50',
          currency: 'USD',
          expense_date: '2024-01-01',
          category: 'Food',
          trip_id: tripId
        },
        {
          name: 'Bus Ticket',
          amount: '25.00',
          currency: 'USD',
          expense_date: '2024-01-03',
          category: 'Transport',
          trip_id: tripId
        }
      ])
      .execute();

    const input: GetExpensesByTripInput = {
      trip_id: tripId
    };

    const result = await getExpensesByTrip(input);

    expect(result).toHaveLength(3);
    
    // Verify all expenses belong to the correct trip
    result.forEach(expense => {
      expect(expense.trip_id).toEqual(tripId);
    });

    // Verify expenses are ordered by expense date (ascending)
    expect(result[0].name).toEqual('Restaurant'); // 2024-01-01
    expect(result[1].name).toEqual('Hotel'); // 2024-01-02
    expect(result[2].name).toEqual('Bus Ticket'); // 2024-01-03

    // Verify numeric conversion
    expect(typeof result[0].amount).toBe('number');
    expect(result[0].amount).toEqual(75.50);
    expect(result[1].amount).toEqual(150.00);
    expect(result[2].amount).toEqual(25.00);

    // Verify date conversion
    expect(result[0].expense_date).toBeInstanceOf(Date);
    expect(result[0].expense_date).toEqual(new Date('2024-01-01'));
    expect(result[1].expense_date).toEqual(new Date('2024-01-02'));
    expect(result[2].expense_date).toEqual(new Date('2024-01-03'));
  });

  it('should return empty array for trip with no expenses', async () => {
    // Create a trip without expenses
    const tripResult = await db.insert(tripsTable)
      .values({
        name: 'Empty Trip',
        destination: 'No Expenses',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'Trip without expenses',
        participants: 'Solo'
      })
      .returning()
      .execute();

    const input: GetExpensesByTripInput = {
      trip_id: tripResult[0].id
    };

    const result = await getExpensesByTrip(input);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should not return expenses from other trips', async () => {
    // Create two trips
    const trip1Result = await db.insert(tripsTable)
      .values({
        name: 'Trip 1',
        destination: 'Destination 1',
        start_date: '2024-01-01',
        end_date: '2024-01-05',
        description: 'First trip',
        participants: 'John'
      })
      .returning()
      .execute();

    const trip2Result = await db.insert(tripsTable)
      .values({
        name: 'Trip 2',
        destination: 'Destination 2',
        start_date: '2024-02-01',
        end_date: '2024-02-05',
        description: 'Second trip',
        participants: 'Jane'
      })
      .returning()
      .execute();

    const trip1Id = trip1Result[0].id;
    const trip2Id = trip2Result[0].id;

    // Create expenses for both trips
    await db.insert(expensesTable)
      .values([
        {
          name: 'Trip 1 Expense',
          amount: '100.00',
          currency: 'USD',
          expense_date: '2024-01-02',
          category: 'Food',
          trip_id: trip1Id
        },
        {
          name: 'Trip 2 Expense',
          amount: '200.00',
          currency: 'USD',
          expense_date: '2024-02-02',
          category: 'Accommodation',
          trip_id: trip2Id
        }
      ])
      .execute();

    const input: GetExpensesByTripInput = {
      trip_id: trip1Id
    };

    const result = await getExpensesByTrip(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Trip 1 Expense');
    expect(result[0].trip_id).toEqual(trip1Id);
    expect(result[0].amount).toEqual(100.00);
    expect(result[0].expense_date).toBeInstanceOf(Date);
    expect(result[0].expense_date).toEqual(new Date('2024-01-02'));
  });
});
